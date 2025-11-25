
import { resolve, dirname, isAbsolute, sep } from "node:path";
import { readFile } from "node:fs/promises";

export async function readJSONConfig (absPath) {
  const configuration = JSON.parse(await readFile(absPath));
  configuration.dbPath = absolutise(absPath, configuration.dbPath);
  return configuration;
}

function absolutise (base, path) {
  if (isAbsolute(path)) return path;
  if (base.endsWith(sep)) return resolve(base, path);
  return resolve(dirname(base), path);
}
