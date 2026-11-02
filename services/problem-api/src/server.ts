import Fastify from "fastify";
import cors from "@fastify/cors";
import { Prisma, PrismaClient, ProblemStatus, Visibility } from "../../../node_modules/.prisma/polisos-problem-client/index.js";
import { randomUUID } from "node:crypto";
import { optionalActor, requireActor, requireRole, requestError } from "./auth.js";
import { startOutboxDispatcher } from "./outbox.js";

const prisma = new PrismaClient();
const app = Fastify({
  logger: {
    redact: ["req.headers.authorization", "req.headers.cookie"],
    level: process.env.LOG_LEVEL ?? "info"
  },
  bodyLimit: 64 * 1024
});

await app.register(cors, {
  origin: (process.env.WEB_ORIGIN ?? "http://localhost:5173").split(","),
  methods: ["GET", "POST", "PATCH", "OPTIONS"]
});

const problemSelect = {
  id: true,
  title: true,
  summary: true,
  sector: true,
  region: true,
  visibility: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  evidence: {
    orderBy: { createdAt: "asc" as const },
    select: { id: true, sourceName: true, sourceUrl: true, description: true, confidence: true, visibility: true, createdAt: true }
  },
  options: {
    orderBy: { createdAt: "asc" as const },
    select: { id: true, title: true, summary: true, expectedOutcome: true, riskNotes: true, createdAt: true }
  }
} satisfies Prisma.ProblemSelect;

const appealSelect = {
  id: true,
  reason: true,
  status: true,
  decision: true,
  createdAt: true,
  decidedAt: true
} satisfies Prisma.AppealSelect;

const transitions: Record<ProblemStatus, ProblemStatus[]> = {
  SUBMITTED: ["TRIAGE", "NEEDS_EVIDENCE", "CLOSED"],
  TRIAGE: ["NEEDS_EVIDENCE", "UNDER_REVIEW", "CLOSED"],
  NEEDS_EVIDENCE: ["UNDER_REVIEW", "CLOSED"],
  UNDER_REVIEW: ["NEEDS_EVIDENCE", "DISCUSSION", "OPTIONS", "CLOSED"],
  DISCUSSION: ["UNDER_REVIEW", "OPTIONS", "CLOSED"],
  OPTIONS: ["PROJECT_PROPOSED", "DISCUSSION", "CLOSED"],
  PROJECT_PROPOSED: ["CLOSED"],
  CLOSED: []
};
const optionStates = new Set<ProblemStatus>([
  ProblemStatus.UNDER_REVIEW,
  ProblemStatus.DISCUSSION,
  ProblemStatus.OPTIONS
]);

function isHttpUrl(value?: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function publicProblem(
  problem: Prisma.ProblemGetPayload<{ select: typeof problemSelect }>,
  allowPrivateEvidence = false
) {
  return {
    id: problem.id,
    title: problem.title,
    summary: problem.summary,
    sector: problem.sector,
    region: problem.region,
    visibility: problem.visibility,
    status: problem.status,
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
    evidence: problem.evidence.filter((item) =>
      item.visibility !== Visibility.PRIVATE || allowPrivateEvidence
    ),
    options: problem.options
  };
}

function eventPayload(problem: {
  id: string;
  title: string;
  summary: string;
  sector: string;
  region: string;
  status: ProblemStatus;
  publishedAt: Date | null;
}) {
  const eventId = randomUUID();
  return {
    eventId,
    eventType: "polis.problem.status-changed.v1",
    occurredAt: new Date().toISOString(),
    problemId: problem.id,
    status: problem.status,
    ...(problem.publishedAt ? { title: problem.title, summary: problem.summary } : {}),
    sector: problem.sector,
    region: problem.region
  };
}

async function recordOutbox(
  tx: Prisma.TransactionClient,
  aggregateId: string,
  eventType: string,
  payload: Prisma.InputJsonValue
) {
  const eventId = (payload as { eventId: string }).eventId;
  await tx.outboxEvent.create({
    data: {
      id: eventId,
      topic: "polis.problem.status.v1",
      eventType,
      aggregateId,
      payload
    }
  });
}

app.get("/health", async () => ({ status: "ok", service: "problem-api" }));

app.get("/api/problems", async () => {
  const problems = await prisma.problem.findMany({
    where: { visibility: { in: [Visibility.PUBLIC, Visibility.PSEUDONYMOUS] }, publishedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: problemSelect
  });
  return { items: problems.map((problem) => publicProblem(problem)) };
});

app.get("/api/review/problems", async (request) => {
  const actor = await requireActor(request.headers.authorization);
  requireRole(actor, "reviewer");
  const items = await prisma.problem.findMany({
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { ...problemSelect, appeals: { orderBy: { createdAt: "desc" }, select: appealSelect } }
  });
  return {
    items: items.map(({ appeals, ...problem }) => ({
      ...publicProblem(problem as Prisma.ProblemGetPayload<{ select: typeof problemSelect }>, true),
      appeals,
      permissions: { canAppeal: false, canReview: true }
    }))
  };
});

app.get("/api/my/problems", async (request) => {
  const actor = await requireActor(request.headers.authorization);
  const items = await prisma.problem.findMany({
    where: { authorSub: actor.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { ...problemSelect, authorSub: true, appeals: { orderBy: { createdAt: "desc" as const }, select: appealSelect } }
  });
  return {
    items: items.map(({ authorSub: _authorSub, appeals, ...problem }) => ({
      ...publicProblem(problem as Prisma.ProblemGetPayload<{ select: typeof problemSelect }>, true),
      appeals,
      permissions: { canAppeal: true, canReview: actor.roles.includes("reviewer") }
    }))
  };
});

app.get<{ Params: { id: string } }>("/api/problems/:id", async (request) => {
  const actor = await optionalActor(request.headers.authorization);
  const problem = await prisma.problem.findUnique({
    where: { id: request.params.id },
    select: { ...problemSelect, authorSub: true, appeals: { orderBy: { createdAt: "desc" }, select: appealSelect } }
  });
  if (!problem) throw requestError(404, "Problem not found.");
  if ((problem.visibility === Visibility.PRIVATE || !problem.publishedAt) && actor?.sub !== problem.authorSub && !actor?.roles.includes("reviewer")) {
    throw requestError(404, "Problem not found.");
  }
  const { authorSub: _privateSubject, ...safe } = problem;
  const mayReadAppeals = actor?.sub === problem.authorSub || Boolean(actor?.roles.includes("reviewer"));
  return {
    ...publicProblem(
      safe as Prisma.ProblemGetPayload<{ select: typeof problemSelect }>,
      problem.visibility === Visibility.PRIVATE && (actor?.sub === problem.authorSub || Boolean(actor?.roles.includes("reviewer")))
    ),
    permissions: {
      canAppeal: actor?.sub === problem.authorSub,
      canReview: Boolean(actor?.roles.includes("reviewer"))
    },
    ...(mayReadAppeals ? { appeals: problem.appeals } : {})
  };
});

app.post<{
  Body: {
    title: string;
    summary: string;
    sector: string;
    region: string;
    visibility: "PUBLIC" | "PSEUDONYMOUS" | "PRIVATE";
    consentToSubmit: boolean;
  };
}>("/api/problems", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["title", "summary", "sector", "region", "visibility", "consentToSubmit"],
      properties: {
        title: { type: "string", minLength: 8, maxLength: 160 },
        summary: { type: "string", minLength: 20, maxLength: 3000 },
        sector: { type: "string", minLength: 2, maxLength: 48 },
        region: { type: "string", minLength: 2, maxLength: 100 },
        visibility: { enum: ["PSEUDONYMOUS", "PRIVATE"] },
        consentToSubmit: { const: true }
      }
    }
  }
}, async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  if (!request.body.consentToSubmit) throw requestError(400, "Confirm the purpose and visibility before submitting.");
  const created = await prisma.$transaction(async (tx) => {
    const problem = await tx.problem.create({
      data: {
        title: request.body.title.trim(),
        summary: request.body.summary.trim(),
        sector: request.body.sector,
        region: request.body.region.trim(),
        visibility: request.body.visibility,
        authorSub: actor.sub,
        consentVersion: "problem-submit-v1"
      }
    });
    return problem;
  });
  return reply.code(201).send({
    id: created.id,
    title: created.title,
    status: created.status,
    visibility: created.visibility,
    createdAt: created.createdAt
  });
});

app.post<{
  Params: { id: string };
  Body: { sourceName: string; sourceUrl?: string; description: string; confidence?: "LOW" | "MEDIUM" | "HIGH" | "UNASSESSED"; consentToSubmit: boolean };
}>("/api/problems/:id/evidence", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["sourceName", "description", "consentToSubmit"],
      properties: {
        sourceName: { type: "string", minLength: 2, maxLength: 160 },
        sourceUrl: { type: "string", maxLength: 2048 },
        description: { type: "string", minLength: 10, maxLength: 1500 },
        confidence: { enum: ["LOW", "MEDIUM", "HIGH", "UNASSESSED"] },
        consentToSubmit: { const: true }
      }
    }
  }
}, async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  const problem = await prisma.problem.findUnique({ where: { id: request.params.id }, select: { id: true, authorSub: true, visibility: true, status: true } });
  if (!problem) throw requestError(404, "Problem not found.");
  if (problem.visibility === Visibility.PRIVATE && problem.authorSub !== actor.sub) throw requestError(404, "Problem not found.");
  if (problem.status === ProblemStatus.CLOSED || problem.status === ProblemStatus.PROJECT_PROPOSED) {
    throw requestError(409, "This report is closed to new evidence. Use the appeal process if a correction is needed.");
  }
  if (!request.body.consentToSubmit) throw requestError(400, "Confirm the purpose before attaching this source.");
  const sourceUrl = request.body.sourceUrl?.trim();
  if (!isHttpUrl(sourceUrl)) throw requestError(400, "Source links must use HTTP or HTTPS.");
  const evidence = await prisma.evidence.create({
    data: {
      problemId: problem.id,
      sourceName: request.body.sourceName.trim(),
      sourceUrl: sourceUrl || null,
      description: request.body.description.trim(),
      confidence: request.body.confidence ?? "UNASSESSED",
      visibility: problem.visibility === Visibility.PRIVATE ? Visibility.PRIVATE : problem.visibility,
      submittedBy: actor.sub,
      consentVersion: "evidence-submit-v1"
    },
    select: { id: true, sourceName: true, sourceUrl: true, description: true, confidence: true, visibility: true, createdAt: true }
  });
  return reply.code(201).send(evidence);
});

app.post<{
  Params: { id: string };
  Body: { title: string; summary: string; expectedOutcome: string; riskNotes: string };
}>("/api/problems/:id/options", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["title", "summary", "expectedOutcome", "riskNotes"],
      properties: {
        title: { type: "string", minLength: 4, maxLength: 160 },
        summary: { type: "string", minLength: 15, maxLength: 2000 },
        expectedOutcome: { type: "string", minLength: 8, maxLength: 1200 },
        riskNotes: { type: "string", minLength: 4, maxLength: 1200 }
      }
    }
  }
}, async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  const problem = await prisma.problem.findUnique({ where: { id: request.params.id }, select: { id: true, authorSub: true, visibility: true, status: true } });
  if (!problem || problem.visibility === Visibility.PRIVATE) throw requestError(404, "Problem not found.");
  if (!optionStates.has(problem.status)) {
    throw requestError(409, "This problem is not yet open for solution options.");
  }
  const option = await prisma.solutionOption.create({
    data: {
      problemId: problem.id,
      title: request.body.title.trim(),
      summary: request.body.summary.trim(),
      expectedOutcome: request.body.expectedOutcome.trim(),
      riskNotes: request.body.riskNotes.trim(),
      createdBySub: actor.sub
    },
    select: { id: true, title: true, summary: true, expectedOutcome: true, riskNotes: true, createdAt: true }
  });
  return reply.code(201).send(option);
});

app.post<{
  Params: { id: string };
  Body: { status: ProblemStatus; reason: string };
}>("/api/problems/:id/review", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["status", "reason"],
      properties: {
        status: { enum: Object.values(ProblemStatus) },
        reason: { type: "string", minLength: 8, maxLength: 1200 }
      }
    }
  }
}, async (request) => {
  const actor = await requireActor(request.headers.authorization);
  requireRole(actor, "reviewer");
  const current = await prisma.problem.findUnique({ where: { id: request.params.id } });
  if (!current) throw requestError(404, "Problem not found.");
  if (current.authorSub === actor.sub) throw requestError(403, "Reviewers cannot review their own report.");
  if (!transitions[current.status].includes(request.body.status)) {
    throw requestError(409, `Cannot move a problem from ${current.status} to ${request.body.status}.`);
  }
  if (request.body.status === ProblemStatus.OPTIONS && current.visibility === Visibility.PRIVATE) {
    throw requestError(409, "Private reports cannot be routed into a public project proposal.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const changed = await tx.problem.updateMany({
      where: { id: current.id, status: current.status },
      data: {
        status: request.body.status,
        publishedAt: current.publishedAt ?? (request.body.status === ProblemStatus.DISCUSSION ? new Date() : undefined)
      }
    });
    if (changed.count !== 1) throw requestError(409, "This problem changed while you were reviewing it. Reload and try again.");
    const updated = await tx.problem.findUniqueOrThrow({ where: { id: current.id } });
    await tx.reviewEntry.create({
      data: {
        problemId: current.id,
        reviewerSub: actor.sub,
        fromStatus: current.status,
        toStatus: request.body.status,
        reason: request.body.reason.trim()
      }
    });
    if (updated.visibility !== Visibility.PRIVATE) {
      const payload = eventPayload(updated);
      await recordOutbox(tx, updated.id, payload.eventType, payload);
    }
    return updated;
  });
  return { id: result.id, status: result.status, updatedAt: result.updatedAt };
});

app.post<{
  Params: { id: string };
  Body: { reason: string };
}>("/api/problems/:id/appeals", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["reason"],
      properties: { reason: { type: "string", minLength: 10, maxLength: 2000 } }
    }
  }
}, async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  const problem = await prisma.problem.findUnique({ where: { id: request.params.id }, select: { id: true, authorSub: true } });
  if (!problem || problem.authorSub !== actor.sub) throw requestError(404, "Problem not found.");
  const appeal = await prisma.appeal.create({
    data: { problemId: problem.id, filedBySub: actor.sub, reason: request.body.reason.trim() },
    select: { id: true, status: true, createdAt: true }
  });
  return reply.code(201).send(appeal);
});

app.patch<{
  Params: { id: string; appealId: string };
  Body: { status: "UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED"; decision: string };
}>("/api/problems/:id/appeals/:appealId", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["status", "decision"],
      properties: {
        status: { enum: ["UPHELD", "RETURNED_FOR_REVIEW", "DISMISSED"] },
        decision: { type: "string", minLength: 10, maxLength: 1200 }
      }
    }
  }
}, async (request) => {
  const actor = await requireActor(request.headers.authorization);
  requireRole(actor, "reviewer");
  const updated = await prisma.$transaction(async (tx) => {
    const appeal = await tx.appeal.findFirst({
      where: { id: request.params.appealId, problemId: request.params.id }
    });
    if (!appeal) throw requestError(404, "Appeal not found.");
    if (appeal.filedBySub === actor.sub) throw requestError(403, "An appeal must be reviewed by someone other than its filer.");
    const priorReview = await tx.reviewEntry.findFirst({
      where: { problemId: appeal.problemId, reviewerSub: actor.sub },
      select: { id: true }
    });
    if (priorReview) throw requestError(403, "An appeal must be reviewed independently of the original reviewer.");
    const changed = await tx.appeal.updateMany({
      where: { id: appeal.id, status: { in: ["FILED", "IN_REVIEW"] } },
      data: {
        status: request.body.status,
        decision: request.body.decision.trim(),
        decidedBySub: actor.sub,
        decidedAt: new Date()
      }
    });
    if (changed.count !== 1) throw requestError(409, "This appeal already has a decision.");
    return tx.appeal.findUniqueOrThrow({ where: { id: appeal.id }, select: appealSelect });
  });
  return updated;
});

app.setErrorHandler((error, _request, reply) => {
  const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
  if (statusCode >= 500) app.log.error({ err: error }, "Problem API request failed.");
  reply.code(statusCode).send({
    error: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    message: statusCode >= 500 ? "The request could not be completed." : (error as Error).message
  });
});

const stopOutbox = startOutboxDispatcher(prisma, app.log);
const port = Number(process.env.PORT ?? "4101");
await app.listen({ host: "0.0.0.0", port });
app.log.info({ port }, "Problem API listening.");

const shutdown = async () => {
  await stopOutbox();
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

