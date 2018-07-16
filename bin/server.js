const http = require("http");
const Koa = require("koa");
const KoaStatic = require("koa-static");

const setupContext = require("../lib/context");
const setupApp = require("../backend/app");
const setupChatbot = require("../chatbot");

const app = new Koa();
const server = http.createServer(app.callback());

app.use(KoaStatic("./frontend/build/"));

const context = setupContext(app, server);
setupApp(context);
setupChatbot(context);

const { log, config } = context;
const host = config.get("host");
const port = config.get("port");
const httpProto = config.get("useHTTPS") ? "HTTPS" : "HTTP";
log.info(`Starting ${httpProto} server on ${host}:${port}`);
server.listen(port, host);
