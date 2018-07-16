const koaBodyParser = require("koa-bodyparser");
const requestId = require("./requestId");
const log = require("./log");
const responseHandler = require("./responseHandler");

module.exports = context => {
  const { app } = context;
  app.use(koaBodyParser());
  app.use(requestId());
  app.use(log(context));
  app.use(responseHandler());
}
