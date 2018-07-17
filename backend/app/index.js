const convert = require("koa-connect");
const history = require("connect-history-api-fallback");

module.exports = (context) => {
  const { app } = context;

  require("./middleware")(context);
  require("./sessions")(context);
  require("./auth")(context);
  require("./sockets")(context);
  require("./routes")(context);

  app.use(convert(history()));
};
