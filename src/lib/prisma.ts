import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

type RuntimeModel = {
  dbName?: string | null;
  fields: { name: string; dbName?: string | null }[];
};

type RuntimeDataModel = {
  models: Record<string, RuntimeModel>;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

function getSchemaFingerprint(client: PrismaClient) {
  const runtime = (client as unknown as { _runtimeDataModel?: RuntimeDataModel })
    ._runtimeDataModel;
  if (!runtime?.models) return "";

  return Object.keys(runtime.models)
    .sort()
    .map((name) => {
      const model = runtime.models[name];
      const fields = model.fields
        .map((field) => {
          const column = field.dbName ? `:${field.dbName}` : "";
          return `${field.name}${column}`;
        })
        .sort()
        .join(",");
      const table = model.dbName ? `@${model.dbName}` : "";
      return `${name}${table}(${fields})`;
    })
    .join("|");
}

// Computed once per module load from the current generated client.
const CURRENT_SCHEMA_FINGERPRINT = getSchemaFingerprint(createPrismaClient());

function isStaleClient(client: PrismaClient) {
  return getSchemaFingerprint(client) !== CURRENT_SCHEMA_FINGERPRINT;
}

if (globalForPrisma.prisma && isStaleClient(globalForPrisma.prisma)) {
  globalForPrisma.prisma = undefined;
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && !isStaleClient(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
