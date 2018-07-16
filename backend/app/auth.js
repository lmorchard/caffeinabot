const passport = require("koa-passport");
const route = require("koa-route");
const Router = require("koa-router");
const twitchStrategy = require("passport-twitch").Strategy;

module.exports = ({ log, db, config, app, server, baseURL }) => {
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser((_id, done) => {
    db.users
      .findOne({ _id })
      .then(record => done(null, record ? record.user : null))
      .catch(err => done(err, null));
  });

  const twitchConfig = config.get("twitch");
  passport.use(
    new twitchStrategy(
      {
        clientID: twitchConfig.clientId,
        clientSecret: twitchConfig.clientSecret,
        callbackURL: `${baseURL}/auth/twitch/callback`,
        scope: "user_read"
      },
      (accessToken, refreshToken, profile, done) => {
        const { id: _id, _json } = profile;
        const user = { ..._json, accessToken, refreshToken };
        log.debug("Twitch profile", user);
        db.users
          .update({ _id }, { _id, user }, { upsert: true })
          .then(() => done(null, user))
          .catch(err => done(err, null));
      }
    )
  );

  const router = new Router({ prefix: "/auth" });

  router
    .get("/user", ctx => {
      ctx.set("Content-Type", "application/json");
      ctx.body = ctx.isAuthenticated() ? ctx.req.user : false;
    })
    .get("/logout", ctx => {
      ctx.logout();
      ctx.redirect("/");
    })
    .get("/twitch", passport.authenticate("twitch"))
    .get(
      "/twitch/callback",
      passport.authenticate("twitch", {
        successRedirect: "/?auth=1",
        failureRedirect: "/?authfail=1"
      })
    );

  app
    .use(passport.initialize())
    .use(passport.session())
    .use(router.routes())
    .use(router.allowedMethods());
};
