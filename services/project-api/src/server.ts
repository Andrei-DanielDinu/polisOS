import Fastify from "fastify";
import cors from "@fastify/cors";
import { Prisma, PrismaClient, ProjectStatus, ProjectRoleName } from "../../../node_modules/.prisma/polisos-project-client/index.js";
import { randomUUID } from "node:crypto";
import { requireActor, requireRole, requestError } from "./auth.js";
import { startOutboxDispatcher } from "./outbox.js";
import { startProblemProjection } from "./problem-events.js";

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

function isWebUrl(value?: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function addOutbox(
  tx: Prisma.TransactionClient,
  aggregateId: string,
  eventType: string,
  status: "PROPOSED" | "ACTIVE"
) {
  const eventId = randomUUID();
  const project = await tx.project.findUnique({
    where: { id: aggregateId },
    select: { id: true, problemId: true }
  });
  if (!project) throw new Error("Project not found while creating event.");
  const payload = {
    eventId,
    eventType,
    occurredAt: new Date().toISOString(),
    projectId: project.id,
    problemId: project.problemId,
    status
  };
  await tx.outboxEvent.create({
    data: {
      id: eventId,
      topic: "polis.project.status.v1",
      eventType,
      aggregateId,
      payload
    }
  });
}

app.get("/health", async () => ({ status: "ok", service: "project-api" }));

app.get("/api/projects", async () => {
  const items = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { milestones: { orderBy: { reportedAt: "desc" } } }
  });
  return {
    items: items.map(({ createdBySub: _createdBySub, authorizedBySub: _authorizedBySub, ...project }) => project)
  };
});

app.get<{ Params: { id: string } }>("/api/projects/:id", async (request) => {
  const project = await prisma.project.findUnique({
    where: { id: request.params.id },
    include: { milestones: { orderBy: { reportedAt: "desc" } } }
  });
  if (!project) throw requestError(404, "Project not found.");
  const { createdBySub: _createdBySub, authorizedBySub: _authorizedBySub, ...safe } = project;
  return safe;
});

app.get<{ Params: { id: string } }>("/api/projects/:id/appeals", async (request) => {
  const actor = await requireActor(request.headers.authorization);
  const project = await prisma.project.findUnique({ where: { id: request.params.id }, select: { id: true } });
  if (!project) throw requestError(404, "Project not found.");
  const items = await prisma.projectAppeal.findMany({
    where: {
      projectId: project.id,
      ...(actor.roles.includes("reviewer") ? {} : { filedBySub: actor.sub })
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, reason: true, status: true, decision: true, createdAt: true, decidedAt: true }
  });
  return { items };
});

app.post<{
  Body: { problemId: string; title: string; publicSummary: string };
}>("/api/projects", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["problemId", "title", "publicSummary"],
      properties: {
        problemId: { type: "string", format: "uuid" },
        title: { type: "string", minLength: 8, maxLength: 160 },
        publicSummary: { type: "string", minLength: 20, maxLength: 2000 }
      }
    }
  }
}, async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  const problem = await prisma.reviewableProblem.findUnique({ where: { problemId: request.body.problemId } });
  if (!problem) {
    throw requestError(409, "A project can be proposed only from a public problem reviewed into the OPTIONS stage.");
  }
  if (problem.status !== "OPTIONS" || !problem.title || !problem.summary) {
    throw requestError(409, "A project can be proposed only from a public problem reviewed into the OPTIONS stage.");
  }
  const problemTitle = problem.title;
  const problemSummary = problem.summary;
  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        problemId: problem.problemId,
        problemTitle,
        problemSummary,
        sector: problem.sector,
        region: problem.region,
        title: request.body.title.trim(),
        publicSummary: request.body.publicSummary.trim(),
        createdBySub: actor.sub
      }
    });
    await tx.projectRole.create({
      data: {
        projectId: created.id,
        personSub: actor.sub,
        role: ProjectRoleName.PROJECT_LEAD,
        scope: "Coordinate this proposal and maintain its public status. This role grants no public authority.",
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    });
    await addOutbox(tx, created.id, "polis.project.proposed.v1", "PROPOSED");
    return created;
  });
  return reply.code(201).send({
    id: project.id,
    problemId: project.problemId,
    title: project.title,
    status: project.status,
    createdAt: project.createdAt
  });
});

app.post<{ Params: { id: string } }>("/api/projects/:id/join", async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  const project = await prisma.project.findUnique({ where: { id: request.params.id }, select: { id: true, status: true } });
  if (!project || project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.STOPPED) {
    throw requestError(404, "Project not found or no longer accepting participants.");
  }
  const role = await prisma.projectRole.upsert({
    where: { projectId_personSub: { projectId: project.id, personSub: actor.sub } },
    create: {
      projectId: project.id,
      personSub: actor.sub,
      role: ProjectRoleName.CONTRIBUTOR,
      scope: "Voluntary contribution to this project only. Leave at any time.",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    },
    update: {
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    },
    select: { role: true, scope: true, expiresAt: true }
  });
  return reply.code(200).send(role);
});

app.post<{
  Params: { id: string };
  Body: {
    institutionName: string;
    authorityReference: string;
    fundingReference: string;
    decisionReason: string;
  };
}>("/api/projects/:id/authorization", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["institutionName", "authorityReference", "fundingReference", "decisionReason"],
      properties: {
        institutionName: { type: "string", minLength: 2, maxLength: 200 },
        authorityReference: { type: "string", minLength: 4, maxLength: 500 },
        fundingReference: { type: "string", minLength: 4, maxLength: 500 },
        decisionReason: { type: "string", minLength: 10, maxLength: 2000 }
      }
    }
  }
}, async (request) => {
  const actor = await requireActor(request.headers.authorization);
  requireRole(actor, "project-owner");
  const current = await prisma.project.findUnique({ where: { id: request.params.id } });
  if (!current) throw requestError(404, "Project not found.");
  if (current.status !== ProjectStatus.PROPOSED) throw requestError(409, "Only proposed projects can be authorized.");
  const project = await prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: current.id },
      data: {
        status: ProjectStatus.ACTIVE,
        institutionName: request.body.institutionName.trim(),
        authorityReference: request.body.authorityReference.trim(),
        fundingReference: request.body.fundingReference.trim(),
        authorizationReason: request.body.decisionReason.trim(),
        authorizedBySub: actor.sub,
        authorizedAt: new Date()
      }
    });
    await addOutbox(tx, updated.id, "polis.project.authorized.v1", "ACTIVE");
    return updated;
  });
  return { id: project.id, status: project.status, authorizedAt: project.authorizedAt };
});

app.post<{
  Params: { id: string };
  Body: { title: string; description: string; dueAt?: string; evidenceUrl?: string };
}>("/api/projects/:id/milestones", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["title", "description"],
      properties: {
        title: { type: "string", minLength: 4, maxLength: 160 },
        description: { type: "string", minLength: 10, maxLength: 1600 },
        dueAt: { type: "string", format: "date-time" },
        evidenceUrl: { type: "string", maxLength: 2048 }
      }
    }
  }
}, async (request, reply) => {
  const actor = await requireActor(request.headers.authorization);
  const project = await prisma.project.findUnique({ where: { id: request.params.id }, select: { id: true, status: true } });
  if (!project || project.status !== ProjectStatus.ACTIVE) throw requestError(409, "Milestones can be reported only for an active project.");
  if (!isWebUrl(request.body.evidenceUrl)) throw requestError(400, "Evidence link must use HTTP or HTTPS.");
  const membership = await prisma.projectRole.findFirst({
    where: {
      projectId: project.id,
      personSub: actor.sub,
      expiresAt: { gt: new Date() }
    }
  });
  if (!membership) throw requestError(403, "Join this project before reporting a milestone.");
  const milestone = await prisma.milestone.create({
    data: {
      projectId: project.id,
      title: request.body.title.trim(),
      description: request.body.description.trim(),
      dueAt: request.body.dueAt ? new Date(request.body.dueAt) : null,
      evidenceUrl: request.body.evidenceUrl?.trim() || null,
      reportedBySub: actor.sub
    },
    select: { id: true, title: true, description: true, dueAt: true, evidenceUrl: true, status: true, reportedAt: true }
  });
  return reply.code(201).send(milestone);
});

app.post<{
  Params: { id: string };
  Body: { reason: string };
}>("/api/projects/:id/appeals", {
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
  const project = await prisma.project.findUnique({ where: { id: request.params.id }, select: { id: true } });
  if (!project) throw requestError(404, "Project not found.");
  const appeal = await prisma.projectAppeal.create({
    data: { projectId: project.id, filedBySub: actor.sub, reason: request.body.reason.trim() },
    select: { id: true, status: true, createdAt: true }
  });
  return reply.code(201).send(appeal);
});

app.patch<{
  Params: { id: string; appealId: string };
  Body: { status: "UPHELD" | "RETURNED_FOR_REVIEW" | "DISMISSED"; decision: string };
}>("/api/projects/:id/appeals/:appealId", {
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
  const appeal = await prisma.projectAppeal.findFirst({
    where: { id: request.params.appealId, projectId: request.params.id },
    include: { project: { select: { createdBySub: true, authorizedBySub: true } } }
  });
  if (!appeal) throw requestError(404, "Appeal not found.");
  if (appeal.filedBySub === actor.sub || appeal.project.createdBySub === actor.sub || appeal.project.authorizedBySub === actor.sub) {
    throw requestError(403, "Appeals must be reviewed by someone independent of the filer and original authorization.");
  }
  if (appeal.status !== "FILED" && appeal.status !== "IN_REVIEW") throw requestError(409, "This appeal already has a decision.");
  const updated = await prisma.projectAppeal.update({
    where: { id: appeal.id },
    data: {
      status: request.body.status,
      decision: request.body.decision.trim(),
      decidedBySub: actor.sub,
      decidedAt: new Date()
    },
    select: { id: true, status: true, decision: true, decidedAt: true }
  });
  return updated;
});

app.setErrorHandler((error, _request, reply) => {
  const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
  if (statusCode >= 500) app.log.error({ err: error }, "Project API request failed.");
  reply.code(statusCode).send({
    error: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    message: statusCode >= 500 ? "The request could not be completed." : (error as Error).message
  });
});

const stopOutbox = startOutboxDispatcher(prisma, app.log);
let stopProjection: (() => Promise<void>) | undefined;
try {
  stopProjection = await startProblemProjection(prisma, app.log);
} catch (error) {
  app.log.warn({ error }, "Problem projection consumer did not connect; it will need an operator restart if Kafka is unavailable.");
}

const port = Number(process.env.PORT ?? "4102");
await app.listen({ host: "0.0.0.0", port });
app.log.info({ port }, "Project API listening.");

const shutdown = async () => {
  if (stopProjection) await stopProjection();
  await stopOutbox();
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

