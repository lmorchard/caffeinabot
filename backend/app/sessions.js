const session = require("koa-session");

module.exports = ({ db, app, config }) => {
  app.keys = config.KEYS.split(",");
  app.use(
    session(
      {
        maxAge: 14 * 86400000, // TODO: config
        renew: true, // TODO: config
        store: {
          async set(_id, value, maxAge, { rolling, changed }) {
            await db.sessions.update({ _id }, { _id, value }, { upsert: true });
          },
          async get(_id, maxAge, { rolling }) {
            const record = await db.sessions.findOne({ _id });
            return record ? record.value : null;
          },
          async destroy(_id) {
            await db.sessions.remove({ _id });
          }
        }
      },
      app
    )
  );
};
