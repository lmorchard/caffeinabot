const passport = require("koa-passport");
const route = require("koa-route");
const twitchStrategy = require("passport-twitch").Strategy;

module.exports = ({ log, db, config, app, server, baseURL }) => {
  const twitchConfig = config.get("twitch");

  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser((_id, done) => {
    db.users.findOne({ _id })
      .then(record => done(null, record ? record.user : null))
      .catch(err => done(err, null));
  });

  passport.use(
    new twitchStrategy(
      {
        clientID: twitchConfig.clientId,
        clientSecret: twitchConfig.clientSecret,
        callbackURL: `${baseURL}/auth/twitch/callback`,
        scope: "user_read"
      },
      (accessToken, refreshToken, profile, done) => {
        const { id: _id, _json: user} = profile;
        db.users.update({ _id }, { _id, user }, { upsert: true })
          .then(() => done(null, user))
          .catch(err => done(err, null));
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(route.get("/auth/user", ctx => {
    ctx.set("Content-Type", "application/json");
    ctx.body = ctx.isAuthenticated() ? ctx.req.user : false;
  }));

  app.use(route.get("/auth/logout", ctx => {
    ctx.logout();
    ctx.redirect("/");
  }));

  app.use(route.get("/auth/twitch", passport.authenticate("twitch")));

  app.use(route.get("/auth/twitch/callback",
    passport.authenticate("twitch", {
      successRedirect: "/?auth=1",
      failureRedirect: "/?authfail=1"
    })
  ));
};
