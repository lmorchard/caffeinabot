const convert = require("koa-connect");
const history = require("connect-history-api-fallback");

const historyFallback = ({ app }) => {
  app.use(convert(history()));
};

module.exports = context => {
  return [
    require("./middleware"),
    require("./sessions"),
    require("./auth"),
    require("./sockets"),
    require("./routes"),
    historyFallback
  ].reduce((context, fn) => fn(context) || context, context);
};
