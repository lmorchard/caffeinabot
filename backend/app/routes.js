const Router = require("koa-router");
const koaBody = require("koa-body");

const requestIdMiddleware = require("./middleware/requestId");
const logMiddleware = require("./middleware/log");
const responseHandlerMiddleware = require("./middleware/responseHandler");

module.exports = (appContext, app, server) => {
  const { log } = appContext;
  const router = module.exports = new Router();

  app.use(koaBody());
  app.use(requestIdMiddleware());
  app.use(logMiddleware(appContext));
  app.use(responseHandlerMiddleware());
  app.use(router.routes());
  app.use(router.allowedMethods());

  router.get("/foo", async ctx => {
    log.debug("WANKEL!");
    ctx.body = "Hello world from foo";
  });
};
