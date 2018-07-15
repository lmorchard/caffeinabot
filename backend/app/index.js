const { PrettyBunyan } = require("../lib/utils");
const koaBody = require("koa-body");
const historyApiFallback = require("koa-history-api-fallback");
const requestIdMiddleware = require("./middleware/requestId");
const logMiddleware = require("./middleware/log");
const responseHandlerMiddleware = require("./middleware/responseHandler");

const setupContext = require("./context");
const setupRoutes = require("./routes");
const setupSockets = require("./sockets");

module.exports = (app, server) => {
  const appContext = setupContext();
  const { log, config } = appContext;

  app.use(historyApiFallback());
  app.use(koaBody());
  app.use(requestIdMiddleware());
  app.use(logMiddleware(appContext));
  app.use(responseHandlerMiddleware());

  setupSockets(appContext, server);
  setupRoutes(appContext, app, server);

  if (config.get("verbose")) {
    const verboseStream = new PrettyBunyan();

    /*
    const PrettyStream = require('bunyan-prettystream');
    const verboseStream = new PrettyStream();
    verboseStream.pipe(process.stdout);
    */

    log.addStream({
      type: "raw",
      level: "debug",
      stream: verboseStream
    });
  }

  return appContext;
};
