import { readFile, writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
  throw new Error("Usage: node scripts/generate-api.mjs [--check]");
}

const schema = new URL("../../contracts/openapi.json", import.meta.url);
const output = new URL("../src/types/api.generated.ts", import.meta.url);
const header = `/**
 * Generated from coding/contracts/openapi.json by openapi-typescript.
 * Do not edit by hand. Run npm run generate:api from coding/frontend.
 * These types do not validate API payloads at runtime.
 */

`;
const generated = header + astToString(await openapiTS(schema));

if (args.includes("--check")) {
  let checkedIn;
  try {
    checkedIn = await readFile(output, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (checkedIn !== generated) {
    console.error("API types are missing or out of date. Run npm run generate:api and review the changes.");
    process.exitCode = 1;
  } else {
    console.log("API types match coding/contracts/openapi.json (no files written).");
  }
} else {
  await writeFile(output, generated);
  console.log("Generated src/types/api.generated.ts from coding/contracts/openapi.json.");
}
