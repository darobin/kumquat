
import { readFile } from "node:fs/promises";

export async function readJSONConfig (absPath) {
  return JSON.parse(await readFile(absPath));
}
