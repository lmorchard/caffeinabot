const http = require("http");
const Koa = require("koa");
const convert = require("koa-connect");
const history = require("connect-history-api-fallback");
const KoaStatic = require("koa-static");
const setupApp = require("./app");

const app = new Koa();
const server = http.createServer(app.callback());

app.use(KoaStatic("./frontend/build/"));
const { log, config } = setupApp(app, server);
app.use(convert(history()));

const host = config.get("host");
const port = config.get("port");
const httpProto = config.get("useHTTPS") ? "HTTPS" : "HTTP";
log.info(`Starting ${httpProto} server on ${host}:${port}`);
server.listen(port, host);
