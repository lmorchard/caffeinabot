const url = require("url");
const WebSocket = require("ws");
const Cookies = require("cookies");
const uuidV4 = require("uuid/v4");

module.exports = ({ log, db, app, config, server, baseURL }) => {
  const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: ({ origin, req, secure }, cb) => {
      if (origin !== baseURL) {
        return cb(false, 403, "Disallowed origin", {});
      }
      fetchUser(req).then(user => {
        req.user = user;
        return cb(true);
      }).catch(err => {
        return cb(false, 403, "Authenticated user required", {});
      });
    }
  });

  server.on("upgrade", (req, socket, head) => {
    const pathname = url.parse(req.url).pathname;
    if (pathname === "/socket") {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit("connection", ws, req);
      });
    }
  });

  // TODO: Stop reimplementing sessions and passport user lookup here.
  const fetchUser = async req => {
    const cookies = new Cookies(req, {}, { keys: config.get("keys") });

    const sessionId = cookies.get("koa:sess", { signed: true });
    if (!sessionId) {
      return null;
    }

    const sessionRecord = await db.sessions.findOne({ _id: sessionId });
    if (
      !sessionRecord ||
      sessionRecord.value._expire < Date.now() ||
      !sessionRecord.value.passport
    ) {
      return null;
    }

    const { value: { passport: { user: userId } } } = sessionRecord;
    if (!userId) {
      return null;
    }

    const userRecord = await db.users.findOne({ _id: userId });
    return userRecord ? userRecord.user : null;
  };

  wss.on("connection", function connection(ws, req) {
    ws.user = req.user;
    ws.id = uuidV4();
    log.debug("WebSocket connection %s from %s", ws.id, (ws.user || {}).name);
    ws.on("message", function incoming(message) {
      log.debug("received: %s from %s", message, ws.user);
      ws.send(`HEARD YOU SAY ${message}`);
    });
    ws.send("something");
  });

  setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }
      client.send(
        JSON.stringify({
          event: "STORE_ACTION",
          type: "SET_SYSTEM_TIME",
          payload: Date.now()
        })
      );
    });
  }, 1000);
};
