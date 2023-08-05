import logUpdate from "log-update";
import chalk from "chalk";

export interface ILoggerAnimateOnceOptions {
  before?: string,
  after?: string,
  speed?: number,
}

export const Frames = {
  uploading: [">    ", "->   ", " ->  ", "  -> ", "   ->", "    -", "     "],
  downloading: ["    <", "   <-", "  <- ", " <-  ", "<-   ", "-    ", "     "],
  progress: ["/", "-", "\\", "|"],
};

export type LoggerMode = "disabled" | "norelogs" | "withrelogs";
export const LoggerModes: LoggerMode[] = ["disabled", "norelogs", "withrelogs"];
export function isLoggerMode(value: unknown): value is LoggerMode { return typeof value === "string" && LoggerModes.includes(value as LoggerMode); }

export class Logger {
  protected prefix: string;
  protected animSpeed = 80;
  protected interval?: NodeJS.Timer;
  constructor(prefix: string, defaultAnimSpeed?: number) {
    this.animSpeed = defaultAnimSpeed ?? this.animSpeed;
    if(process.env.LOGS === "norelogs") this.animSpeed = 0;
    else if(process.env.LOGS === "disabled") this.animSpeed = -1;
    this.prefix = prefix;
  }
  log(message: string, ...args: unknown[]) {
    if(this.animSpeed === -1) return;
    this.cycleStop();
    console.log(`${this.prefix} ${message}`, ...args);
  }
  logSucc(message: string, ...args: unknown[]) {
    this.log(chalk.green(`✓ ${message}`, ...args));
  }
  logWarn(message: string, ...args: unknown[]) {
    this.log(chalk.yellow(`⚠ ${message}`, ...args));
  }
  logFail(message: string, ...args: unknown[]) {
    this.log(chalk.red(`✕ ${message}`, ...args));
  }
  relog(message: string, ...args: unknown[]) {
    if(this.animSpeed <= 0) return this.log(message, ...args);
    this.cycleStop();
    logUpdate(`${this.prefix} ${message}`, ...args.map(a => `${a}`));
  }
  relogSucc(message: string, ...args: unknown[]) {
    this.relog(chalk.green(`✓ ${message}`, ...args));
  }
  relogWarn(message: string, ...args: unknown[]) {
    this.relog(chalk.yellow(`⚠ ${message}`, ...args));
  }
  relogFail(message: string, ...args: unknown[]) {
    this.relog(chalk.red(`✕ ${message}`, ...args));
  }
  async once(frames: keyof typeof Frames, options: ILoggerAnimateOnceOptions) {
    if(this.animSpeed <= 0) return;
    this.cycleStop();
    const { before = "", after = "", speed = this.animSpeed } = options;
    for (const frame of Frames[frames]) {
      const spacedVars = [before, frame, after].map(s => s ? ` ${s}` : "").join("");
      await new Promise(resolve => setTimeout(
        () => { logUpdate(`${this.prefix}${spacedVars}`); resolve(void 0); },
        speed
      ));
    }
  }
  async cycle(frames: keyof typeof Frames, options: ILoggerAnimateOnceOptions) {
    if(this.animSpeed <= 0) return;
    this.cycleStop();
    const { before = "", after = "", speed = this.animSpeed } = options;
    let index = 0;
    this.interval = setInterval(() => {
      index = ++index % Frames[frames].length;
      const frame = Frames[frames][index];
      const spacedVars = [before, frame, after].map(s => s ? ` ${s}` : "").join("");
      logUpdate(`${this.prefix}${spacedVars}`);
    }, speed);
  }
  cycleStop() {
    if(this.animSpeed <= -1) return;
    clearInterval(this.interval);
  }
}