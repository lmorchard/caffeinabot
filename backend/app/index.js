const { PrettyBunyan } = require("../lib/utils");

const setupContext = require("./context");
const setupRoutes = require("./routes");
const setupSockets = require("./sockets");

module.exports = (app, server) => {
  const appContext = setupContext();
  const { log, config } = appContext;

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
