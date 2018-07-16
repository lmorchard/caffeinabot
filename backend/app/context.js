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

  const db = name =>
    Datastore.create({
      filename: `./data/${name}.db`,
      autoload: true,
      timestampData: true
    });

  return {
    app,
    server,
    config,
    baseURL,
    log,
    db: {
      sessions: db("sessions"),
      users: db("users")
    }
  };
};
