const Router = require("koa-router");

module.exports = ({ log, app, server}) => {
  const router = module.exports = new Router();

  router.get("/foo", async ctx => {
    log.debug("WANKEL!");
    ctx.body = "Hello world from foo auth=" + ctx.isAuthenticated() + " user=" + JSON.stringify(ctx.req.user);
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
};
