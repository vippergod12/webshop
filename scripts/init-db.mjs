import { Pool } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[init-db] Missing DATABASE_URL in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const schemaPath = join(__dirname, "..", "db", "schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

// Strip line comments first, then split on semicolons.
const cleaned = schema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = cleaned
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

let failed = 0;
for (const statement of statements) {
  try {
    await pool.query(statement);
    const head = statement.split("\n")[0].slice(0, 80);
    console.log("[ok]", head);
  } catch (err) {
    failed++;
    console.error("[fail]", statement.split("\n")[0]);
    console.error(err);
  }
}

await pool.end();

if (failed > 0) {
  console.log(`\n✗ DB schema init finished with ${failed} failure(s).`);
  process.exit(1);
} else {
  console.log("\n✓ DB schema initialized.");
}
