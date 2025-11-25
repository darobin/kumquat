
import * as xrpc from '@atproto/xrpc-server';
import { Lexicons } from '@atproto/lexicon';

// - an XRPC server for this that can be mounted
// - also the built in lexicon for at.kumqu (if possible)
// - optional auth
// - listLexica() — returns what it listens for
// - query() — runs some mango

// Lexicons
const lexiconList = [
  {
    lexicon: 1,
    id: 'at.kumqu.listLexica',
    defs: {
      main: {
        type: 'query',
        description: 'List the lexica indexed by this instance.',
        output: {
          encoding: "application/json",
          schema: {
            type: 'object',
            required: ['lexica'],
            properties: {
              lexica: {
                type: 'array',
                minLength: 1,
                items: {
                  type: 'string',
                  // format: 'nsid', // won't validate globs
                },
              },
            },
          },
        },
      },
    },
  },
  {
    lexicon: 1,
    id: 'at.kumqu.query',
    defs: {
      main: {
        type: 'procedure',
        description: 'Query the database using Mango.',
        input: {
          type: 'object',
          required: ['selector'],
          properties: {
            selector: { type: 'unknown' }, // we don't validate Mango
            fields: { type: 'array', minLength: 1, items: { type: 'string' } },
            sort: { type: 'array', minLength: 1, items: { type: 'string' } },
            limit: { type: 'integer', minimum: 1 },
            skip: { type: 'integer', minimum: 1 },
            use_index: { type: 'unknown' }, // not doing array/string unions for this
          },
          encoding: "application/json",
        },
        output: {
          type: 'object',
          required: ['docs'],
          properties: {
            docs: { type: 'array', minLength: 1, items: { type: 'unknown' } },
            warning: { type: 'string' },
          },
        },
      },
    },
  },
];
const lexiconValidator = new Lexicons();
lexiconList.forEach(lex => lexiconValidator.add(lex));

export default async function createXRPCServer (ctx) {
  const errorParser = (err) => {
    ctx.logger.error({ err }, 'XRPC explosion');
    return xrpc.XRPCError.fromError(err);
  }
  const server = xrpc.createServer(lexiconList, { errorParser });

  // Example auth handler that requires login and sets up agent with session.
  // const mustBeLoggedIn = async ({ req, res }) => {
  //   const session = await getIronSession(req, res, SESSION_PARAMS);
  //   const error = (message) => {
  //     ctx.logger.error(message);
  //     return { status: 401, error: 'AuthError', message };
  //   }
  //   if (!session.did) return error('No DID in session.');
  //   try {
  //     const oauthSession = await ctx.oauthClient.restore(session.did);
  //     return oauthSession ? { session, agent: new Agent(oauthSession) } : error('No OAuth session.');
  //   }
  //   catch (err) {
  //     ctx.logger.warn({ err }, 'oauth restore failed');
  //     session.destroy();
  //     return error('Oauth restore failed.');
  //   }
  // };

  server.method(
    'at.kumqu.listLexica',
    {
      // auth: mustBeLoggedIn,
      handler: async () => {
        try {
          return response({ lexica: ctx.lexica });
        }
        catch (err) {
          ctx.logger.error({ err }, 'listLexica failed');
        }
      }
    }
  );

  server.method(
    'at.kumqu.query',
    {
      // auth: mustBeLoggedIn,
      handler: async ({ input: { body } }) => {
        try {
          const res = await ctx.db.find(body);
          return response(res);
        }
        catch (err) {
          ctx.logger.error({ err }, 'query failed');
        }
      }
    }
  );

  return server;
}

function response (body) {
  return { encoding: 'application/json', body };
}
