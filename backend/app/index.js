module.exports = (app, server) => {
  const context = require("./context")(app, server);
  const { log, config } = context;

  require("./middleware")(context);
  require("./sessions")(context);
  require("./auth")(context);
  require("./sockets")(context);
  require("./routes")(context);

  if (config.get("verbose")) {
    const { PrettyBunyan } = require("../lib/utils");
    const verboseStream = new PrettyBunyan();
    log.addStream({
      type: "raw",
      level: "debug",
      stream: verboseStream
    });
  }

  return context;
};
