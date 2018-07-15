const koaBodyParser = require("koa-bodyparser");
const session = require("koa-session");
const requestIdMiddleware = require("./middleware/requestId");
const logMiddleware = require("./middleware/log");
const responseHandlerMiddleware = require("./middleware/responseHandler");

const { PrettyBunyan } = require("../lib/utils");

const setupContext = require("./context");
const setupRoutes = require("./routes");
const setupSockets = require("./sockets");

module.exports = (app, server) => {
  const context = setupContext();
  const { log, config } = context;

  app.use(koaBodyParser());
  app.use(requestIdMiddleware());
  app.use(logMiddleware(context));
  app.use(responseHandlerMiddleware());

  setupSessions(context, app);
  setupSockets(context, server);
  setupRoutes(context, app, server);

  if (config.get("verbose")) {
    const verboseStream = new PrettyBunyan();
    log.addStream({
      type: "raw",
      level: "debug",
      stream: verboseStream
    });
  }

  return context;
};

function setupSessions(context, app) {
  const { db } = context;
  // TODO: Move a bunch of things in here to config
  app.keys = ["8675309"];
  app.use(
    session(
      {
        maxAge: 14 * 86400000,
        renew: true,
        store: {
          async set(_id, value, maxAge, { rolling, changed }) {
            await db.sessions.update({ _id }, { _id, value }, { upsert: true });
          },
          async get(_id, maxAge, { rolling }) {
            const record = await db.sessions.findOne({ _id });
            return record ? record.value : null;
          },
          async destroy(_id) {
            await db.sessions.remove({ _id });
          }
        }
      },
      app
    )
  );
}
