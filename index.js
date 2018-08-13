require('dotenv').config();

const config = require("./lib/config")();

const path = require("path");
const http = require("http");
const Koa = require("koa");
const KoaStatic = require("koa-static");

const app = new Koa();
const server = http.createServer(app.callback());

const webPath = path.join(__dirname, "./frontend/build/");
app.use(KoaStatic(webPath));

const { log } = require("./backend")({ config, app, server });

const httpProto = config.USE_HTTPS ? "HTTPS" : "HTTP";

log.info(`Starting ${httpProto} server on ${config.HOST}:${config.PORT}`);
server.listen(config.PORT, config.HOST);
