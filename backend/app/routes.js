const Router = require("koa-router");

module.exports = (appContext, app, server) => {
  const { log } = appContext;
  const router = module.exports = new Router();

  router.get("/foo", async ctx => {
    log.debug("WANKEL!");
    ctx.body = "Hello world from foo";
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
};
