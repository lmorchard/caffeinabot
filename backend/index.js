const config = require("config");
const bunyan = require("bunyan");
const Datastore = require("nedb-promises");

module.exports = (app, server) => {
  const host = config.get("host");
  const port = config.get("port");
  const useHTTPS = config.get("useHTTPS");

  const baseURL =
    (useHTTPS ? "https" : "http") +
    "://" +
    host +
    (port == "80" ? "" : `:${port}`);

  const log = bunyan.createLogger({ ...config.get("log") });

  if (config.get("verbose")) {
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
