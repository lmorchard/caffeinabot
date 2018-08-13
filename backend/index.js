const bunyan = require("bunyan");
const Datastore = require("nedb-promises");

module.exports = ({ config, app, server }) => {
  const host = config.HOST;
  const port = config.PORT;
  const useHTTPS = config.USE_HTTP;

  const baseURL =
    (useHTTPS ? "https" : "http") +
    "://" +
    host +
    (port == "80" ? "" : `:${port}`);

  const log = bunyan.createLogger({
    name: "caffeinabot",
    level: "debug",
    streams: [
      {
        type: "rotating-file",
        path: "./logs/debug.log",
        level: "debug"
      }
    ]
  });

  if (config.VERBOSE) {
    const { PrettyBunyan } = require("../lib/utils");
    const verboseStream = new PrettyBunyan();
    log.addStream({
      type: "raw",
      level: "debug",
      stream: verboseStream
    });
  }

  const db = name =>
    Datastore.create({
      filename: `./data/${name}.db`,
      autoload: true,
      timestampData: true
    });

  return [
    require("./app"),
    require("./chatbot")
  ].reduce((context, fn) => fn(context) || context, {
    app,
    server,
    config,
    baseURL,
    log,
    db: {
      sessions: db("sessions"),
      users: db("users"),
      appStates: db("appStates")
    }
  });
}
