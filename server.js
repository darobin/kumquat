
import { cwd } from "node:process";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { program } from 'commander';
import { readJSONConfig } from "./lib/config.js";
import Context from "./lib/context.js";
import Firehose from "./lib/firehose.js";
import makeRel from './lib/rel.js';

const rel = makeRel(import.meta.url);
const { version } = JSON.parse(await readFile(rel('./package.json')));

program
  .name('nemik')
  .description('All-purpose document generation')
  .version(version)
;

program
  .option('-c, --config <path>', 'path to a configuration file')
  .action(async (options) => {
    await run(options);
  })
;

program.parse();

// Server that brings it all together and can run as bin.
export async function run ({ config }) {
  const cnf = await readJSONConfig(resolve(cwd(), config));
  const ctx = new Context(cnf);
  // XXX need a DB here
  const fh = new Firehose(ctx);
  ctx.firehose = fh;
  // XXX need to start things
}
