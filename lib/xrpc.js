
import * as xrpc from '@atproto/xrpc-server';
import { Lexicons } from '@atproto/lexicon';

// - an XRPC server for this that can be mounted
// - also the built in lexicon for at.kumqu (if possible)
// - optional auth
// - listLexica() — returns what it listens for
// - query() — runs some mango

// Lexicons
const lexiconList = [
  // XXX define lexicons
];
const lexiconValidator = new Lexicons();
lexiconList.forEach(lex => lexiconValidator.add(lex));

export default async function createXRPCServer(ctx) {
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
          const lexica = 'XXX'; // XXX get the info from the configuration on ctx
          return response(lexica);
        }
        catch (err) {
          ctx.logger.error({ err }, 'listLexica failed');
        }
      }
    }
  );
}

function response (body) {
  return { encoding: 'application/json', body };
}
