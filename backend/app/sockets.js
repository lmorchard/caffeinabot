const WebSocket = require("ws");

module.exports = (appContext, server) => {
  const { log } = appContext;

  const wss = new WebSocket.Server({ server });
  wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
      log.debug("received: %s", message);
      ws.send(`HEARD YOU SAY ${message}`);
    });

    ws.send("something");
  });

  setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState !== WebSocket.OPEN) {
        return;
      }
      client.send(JSON.stringify({
        event: "STORE_ACTION",
        type: "SET_SYSTEM_TIME",
        payload: Date.now()
      }));
    });
  }, 1000);
};
