import { neon, NeonQueryFunction } from "@neondatabase/serverless";

type SqlClient = NeonQueryFunction<false, false>;

let _sql: SqlClient | null = null;

function getClient(): SqlClient {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL. Add it to .env (Neon pooled connection string)."
    );
  }
  _sql = neon(url);
  return _sql;
}

// Lazy proxy that only resolves the connection on first use.
// Supports both tagged-template usage `sql\`...\`` and function call `sql(text, params)`.
export const sql: SqlClient = new Proxy(function () {} as unknown as SqlClient, {
  apply(_target, _thisArg, args) {
    return (getClient() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    const client = getClient() as unknown as Record<string, unknown>;
    const value = client[prop as string];
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
}) as SqlClient;
