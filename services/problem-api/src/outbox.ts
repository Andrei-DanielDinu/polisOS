import { Kafka, logLevel } from "kafkajs";
import type { PrismaClient } from "../../../node_modules/.prisma/polisos-problem-client/index.js";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: "polisos-problem-api",
  brokers,
  logLevel: logLevel.NOTHING
});
const producer = kafka.producer();
let connecting: Promise<void> | undefined;

async function ensureProducer() {
  if (!connecting) {
    connecting = producer.connect().catch((error) => {
      connecting = undefined;
      throw error;
    });
  }
  await connecting;
}

export function startOutboxDispatcher(prisma: PrismaClient, logger: { warn: (obj: unknown, msg?: string) => void }) {
  let busy = false;
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const pending = await prisma.outboxEvent.findMany({
        where: { publishedAt: null },
        orderBy: { createdAt: "asc" },
        take: 25
      });
      for (const event of pending) {
        try {
          await ensureProducer();
          await producer.send({
            topic: event.topic,
            messages: [{
              key: event.aggregateId,
              value: JSON.stringify(event.payload),
              headers: { "event-type": event.eventType, "event-id": event.id }
            }]
          });
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: { publishedAt: new Date(), lastError: null }
          });
        } catch (error) {
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              attempts: { increment: 1 },
              lastError: error instanceof Error ? error.message.slice(0, 790) : "Unknown broker error"
            }
          }).catch(() => undefined);
          logger.warn({ eventId: event.id }, "Kafka publication will retry.");
          break;
        }
      }
    } catch (error) {
      logger.warn({ error }, "Outbox polling failed.");
    } finally {
      busy = false;
    }
  }, 750);

  timer.unref();
  return async () => {
    clearInterval(timer);
    if (connecting) await connecting.catch(() => undefined);
    await producer.disconnect().catch(() => undefined);
  };
}

