const { Writable } = require("stream");
const chalk = require("chalk");

class PrettyBunyan extends Writable {
  constructor(options) {
    super(options);

    const TRACE = 10;
    const DEBUG = 20;
    const INFO = 30;
    const WARN = 40;
    const ERROR = 50;
    const FATAL = 60;

    this.levelFromName = {
      trace: TRACE,
      debug: DEBUG,
      info: INFO,
      warn: WARN,
      error: ERROR,
      fatal: FATAL
    };

    this.colorFromName = {
      trace: "gray",
      debug: "magenta",
      info: "green",
      warn: "yellow",
      error: "red",
      fatal: "bgRed"
    };

    this.nameFromLevel = {};
    Object.keys(this.levelFromName).forEach(name => {
      this.nameFromLevel[this.levelFromName[name]] = name;
    });
  }

  write(data) {
    const time = chalk.gray(`[${data.time.toISOString()}]`);

    const levelName = this.nameFromLevel[data.level];
    const levelColor = this.colorFromName[levelName];
    const level = chalk[levelColor](`[${levelName}]`);

    const event = data.event ? chalk.white(`(${data.event}) `) : "";

    process.stdout.write(`${time} ${level} ${event}${data.msg}\n`);
  }
}

module.exports = {
  PrettyBunyan
};
