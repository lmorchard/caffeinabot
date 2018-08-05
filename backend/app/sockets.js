const url = require("url");
const WebSocket = require("ws");
const Cookies = require("cookies");
const uuidV4 = require("uuid/v4");
const { actions, fromServer } = require("../../lib/store");

module.exports = ({ log, db, app, config, server, baseURL }) => {
  const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: ({ origin, req, secure }, cb) => {
      if (origin !== baseURL) {
        return cb(false, 403, "Disallowed origin", {});
      }
      fetchUser(req)
        .then(user => {
          req.user = user;
          return cb(true);
        })
        .catch(err => {
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
    ws.on("message", message => {
      try {
        const data = JSON.parse(message);
        const name = data.event in socketEventHandlers ? data.event : "default";
        socketEventHandlers[name]({ ws, data });
      } catch (err) {
        log.error("socket message error", err, data);
      }
    });
  });

  const socketEventHandlers = {
    storeDispatch: ({ ws, data }) => {
      // Relay storeDispatch messages to the user's other clients
      wss.clients.forEach(client => {
        if (client.id !== ws.id && client.user._id === ws.user._id) {
          client.send(
            JSON.stringify({ event: "storeDispatch", action: data.action })
          );
        }
      });
    },
    default: ({ ws, data }) => {
      log.debug("Unimplemented message", data, ws.id, (ws.user || {}).name);
    }
  };

  if (false)
    setInterval(() => {
      wss.clients.forEach(client => {
        if (client.readyState !== WebSocket.OPEN) {
          return;
        }
        client.send(
          JSON.stringify({
            event: "storeDispatch",
            action: fromServer(actions.setSystemTime(Date.now()))
          })
        );
      });
    }, 1000);
};
