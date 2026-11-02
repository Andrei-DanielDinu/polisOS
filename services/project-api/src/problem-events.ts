import { Kafka, logLevel } from "kafkajs";
import type { PrismaClient } from "../../../node_modules/.prisma/polisos-project-client/index.js";
import type { ProblemStatusChangedV1 } from "../../../packages/contracts/src/index.js";

const kafka = new Kafka({
  clientId: "polisos-project-projection",
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",").map((x) => x.trim()).filter(Boolean),
  logLevel: logLevel.NOTHING
});

function isProblemStatusChanged(value: unknown): value is ProblemStatusChangedV1 {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return event.eventType === "polis.problem.status-changed.v1" &&
    typeof event.eventId === "string" &&
    typeof event.problemId === "string" &&
    typeof event.status === "string" &&
    (event.title === undefined || typeof event.title === "string") &&
    (event.summary === undefined || typeof event.summary === "string") &&
    typeof event.sector === "string" &&
    typeof event.region === "string";
}

export async function startProblemProjection(prisma: PrismaClient, logger: { error: (obj: unknown, msg?: string) => void }) {
  const consumer = kafka.consumer({ groupId: "polisos-project-projection-v1" });
  await consumer.connect();
  await consumer.subscribe({ topic: "polis.problem.status.v1", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      let candidate: unknown;
      try {
        candidate = JSON.parse(message.value.toString("utf8"));
      } catch {
        logger.error({}, "Ignored malformed problem event.");
        return;
      }
      if (!isProblemStatusChanged(candidate)) {
        logger.error({}, "Ignored problem event that did not match the shared contract.");
        return;
      }
      const event = candidate;
      await prisma.$transaction(async (tx) => {
        const processed = await tx.processedEvent.findUnique({ where: { eventId: event.eventId } });
        if (processed) return;
        await tx.processedEvent.create({
          data: { eventId: event.eventId, eventType: event.eventType }
        });
        await tx.reviewableProblem.upsert({
          where: { problemId: event.problemId },
          create: {
            problemId: event.problemId,
            title: event.title ?? null,
            summary: event.summary ?? null,
            sector: event.sector,
            region: event.region,
            status: event.status,
            sourceEventId: event.eventId
          },
          update: {
            title: event.title ?? null,
            summary: event.summary ?? null,
            sector: event.sector,
            region: event.region,
            status: event.status,
            sourceEventId: event.eventId
          }
        });
      });
    }
  });
  return async () => {
    await consumer.stop().catch(() => undefined);
    await consumer.disconnect().catch(() => undefined);
  };
}

