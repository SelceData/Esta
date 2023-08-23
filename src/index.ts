import chalk from "chalk";
import { OAuth2Scopes } from "discord.js";
import { Bot, CommandsManager, Logger } from "./Bot.js";
import dotenv from "dotenv";
import { WebApp, WebPort, loggerWeb } from "./web/index.js";

dotenv.config();

const logger = new Logger("Bot-init");

const token = process.env.TOKEN;
const appId = process.env.APPID;

if (process.argv.includes("web-only")) {
  WebApp.listen(WebPort, () => {
    loggerWeb.log(`Listening on port ${WebPort}.`);
  });
} else {
  logger.cycle("progress", { after: `${chalk.cyan("Slash-commands")} ${chalk.magenta("uploading")}` });
  if (token && appId)
    CommandsManager.put(token, appId)
      .then(() => {
        logger.cycle("progress", { after: chalk.magenta("connecting") });
        Bot.login(token)
          .then(async () => {
            await logger.once("progress", { after: chalk.magenta("connecting") });
            logger.relogSucc(`Connected. ${chalk.cyan(Bot.generateInvite({ scopes: [OAuth2Scopes.Bot, OAuth2Scopes.MessagesRead] }))}`);
            WebApp.listen(WebPort, () => {
              loggerWeb.log(`Listening on port ${WebPort}.`);
            });
          })
          .catch((error: Error) => {
            logger.relogFail(`Bot ${chalk.magenta(JSON.stringify(error))}`);
            process.exit();
          });
      })
      .catch((error: Error) => {
        logger.relogFail(`Slash-commands ${chalk.magenta(error.message)}`);
        process.exit();
      });
}

process.on("uncaughtException", function (exception) {
  console.error(exception);
});