const bunyan = require("bunyan");
const config = require("config");

module.exports = options => {
  const log = bunyan.createLogger({
    ...config.get("log")
  });
  return { log, config };
};
