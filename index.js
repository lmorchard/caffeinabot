const path = require("path");
const http = require("http");
const Koa = require("koa");
const KoaStatic = require("koa-static");

const app = new Koa();
const server = http.createServer(app.callback());

const webPath = path.join(__dirname, "./frontend/build/");
app.use(KoaStatic(webPath));

const { log, config } = require("./backend")(app, server);

const host = config.get("host");
const port = config.get("port");
const httpProto = config.get("useHTTPS") ? "HTTPS" : "HTTP";

log.info(`Starting ${httpProto} server on ${host}:${port}`);
server.listen(port, host);
