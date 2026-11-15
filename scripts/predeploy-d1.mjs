import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const configPath = new URL("../wrangler.jsonc", import.meta.url);
const source = readFileSync(configPath, "utf8");
const databases = JSON.parse(stripJsonComments(source)).d1_databases;
const listedResponse = JSON.parse(execFileSync("npx", ["wrangler", "d1", "list", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
}));
const listed = Array.isArray(listedResponse) ? listedResponse : listedResponse.result;
if (!Array.isArray(listed)) throw new Error("Wrangler did not return a D1 database list");

const idsByName = new Map(listed.map((database) => [database.name, database.uuid]));
for (const database of databases) {
  const id = idsByName.get(database.database_name);
  if (!id) throw new Error(`D1 database not found: ${database.database_name}`);
  const placeholder = JSON.stringify(database.database_id);
  const replacement = JSON.stringify(id);
  const expected = JSON.stringify(database.database_id);
  if (placeholder !== expected) throw new Error("Unexpected D1 configuration");
  database.database_id = id;
}

let output = source;
for (const database of databases) {
  output = output.replace(JSON.stringify(sourceDatabaseId(source, database.database_name)), JSON.stringify(database.database_id));
}
writeFileSync(configPath, output);

function sourceDatabaseId(text, name) {
  const match = text.match(new RegExp(`"database_name"\\s*:\\s*"${escapeRegExp(name)}"[\\s\\S]*?"database_id"\\s*:\\s*"([^"]+)"`));
  if (!match) throw new Error(`D1 database configuration not found: ${name}`);
  return match[1];
}

function stripJsonComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
