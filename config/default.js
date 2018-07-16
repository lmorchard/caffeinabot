module.exports = {
  host: "127.0.0.1",
  port: "8080",
  useHTTPS: false,
  keys: ["12345"],
  session: {
    maxAge: 14 * 86400000,
    renew: true
  },
  log: {
    name: "caffeinabot",
    level: "debug",
    streams: [
      {
        type: "rotating-file",
        path: "./logs/debug.log",
        level: "debug"
      }
    ]
  }
};
