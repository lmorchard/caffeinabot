const bunyan = require("bunyan");
const config = require("config");

const Datastore = require("nedb-promises");

module.exports = options => {
  return {
    config,
    log: bunyan.createLogger({
      ...config.get("log")
    }),
    db: {
      sessions: Datastore.create({
        filename: "./data/sessions.db",
        autoload: true,
        timestampData: true
      })
    }
  };
};
