#!/usr/bin/env node

import { cwd } from "node:process";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { program } from 'commander';
import express from 'express';
import { readJSONConfig } from "./lib/config.js";
import DB from "./lib/db.js";
import Context from "./lib/context.js";
import Firehose from "./lib/firehose.js";
import createXRPCServer from './lib/xrpc.js';
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
  ctx.db = new DB(ctx);
  await ctx.db.start();
  ctx.logger.info('database started');
  ctx.firehose = new Firehose(ctx);
  await ctx.firehose.start();
  ctx.logger.info('firehose started');
  const app = express();
  const xrpc = await createXRPCServer(ctx);
  app.use(xrpc.router);
  await new Promise((resolve) => {
    app.listen(ctx.port, () =>{
      ctx.logger.info(`XRPC started at http://localhost:${ctx.port}/`);
      resolve();
    });
  });
}
