import { Client, Events, GatewayIntentBits } from "discord.js";
import DataBase from "./utils/DataBase.js";
import { CommandName } from "./components/Commands.js";
import { Session, SessionClosedReason, SessionJoinResult, SessionKickResult } from "./types/Session.js";
import { Player, PlayerStatus } from "./types/user/Player.js";
import { Messages } from "./components/Messages.js";
import { PlaceEstate } from "./types/place/PlaceEstate.js";
import { Buy } from "./types/place/action/Buy.js";
import chalk from "chalk";
import * as CommandsManager from "./utils/CommandsManager.js";
import { ButtonName } from "./components/Buttons.js";
import { Casino } from "./types/place/action/Casino.js";
import { Dice } from "./utils/Random.js";
import { Logger } from "./utils/Logger.js";

const logger = new Logger("Bot");

const Bot = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = new DataBase("database.json");

Bot.on(Events.Error,
  function (error: Error) {
    logger.relogFail(`Error: ${chalk.magenta(error.message)}`);
  }
);

Bot.on(Events.MessageDelete,
  function (message) {
    const session = db.data.sessions.get(message.id);
    if (session) session.close(SessionClosedReason.MessageDeleted);
  }
);

Bot.on(Events.InteractionCreate,
  async function (interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command_name = interaction.commandName as CommandName;
        switch (command_name) {
          case "start":
            const session = await Session.create(db, interaction);
            interaction.editReply(Messages.sessionInLobby(session));
            break;

          case "profile":
            interaction.reply(Messages.commandNotImplemented);
            break;

          default:
            logger.logFail(`Unknown slash command: ${command_name}`);
            break;
        }
      } else if (interaction.isButton()) {
        const button_name = interaction.customId as ButtonName;
        const sessiondb = Session.extract(db, interaction.message.id);
        const playerdb = sessiondb ? Player.extract(sessiondb, interaction.user) : undefined;
        switch (button_name) {
          case "leave":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else switch (playerdb.kick()) {
              case SessionKickResult.AllPlayersLeft:
                interaction.deferUpdate();
                sessiondb.close(SessionClosedReason.AllPlayersLeft);
                break;
              case SessionKickResult.IsNotPlayer:
                interaction.reply(Messages.playerNotPlayer);
                break;
              case SessionKickResult.Success:
                interaction.deferUpdate();
                sessiondb.updateMessage();
                break;
            }
            break;
          case "joinLeave":
            if(!sessiondb) interaction.reply(Messages.playerNotPlayer);
            else {
              const player = playerdb ?? Player.create(db, sessiondb, interaction.user);
              const joinresult = player.join(sessiondb);

              switch (joinresult) {
                case SessionJoinResult.Success:
                  interaction.deferUpdate();
                  sessiondb.updateMessage();
                  break;
                case SessionJoinResult.AlreadyJoined:
                  switch (player.kick()) {
                    case SessionKickResult.AllPlayersLeft:
                      interaction.deferUpdate();
                      break;
                    case SessionKickResult.IsNotPlayer:
                      interaction.reply(Messages.playerNotPlayer);
                      break;
                    case SessionKickResult.Success:
                      interaction.deferUpdate();
                      sessiondb.updateMessage();
                      break;
                  }
                  break;
                case SessionJoinResult.IsFull:
                  interaction.reply(Messages.playerLobbyIsFull);
                  break;
                case SessionJoinResult.NoColors:
                  interaction.reply(Messages.playerNoColors);
                  break;

                default:
                  logger.logFail(`Unknown session join result ${joinresult}.`);
                  break;
              }
            }
            break;
          case "ready":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else {
              interaction.deferUpdate();
              playerdb.status = playerdb.status == PlayerStatus.Ready ? PlayerStatus.Idle : PlayerStatus.Ready;
              if (sessiondb.allPlayersReady.length === sessiondb.allPlayers.length) sessiondb.start();
              else sessiondb.updateMessage();
            }
            break;
          case "myPlace":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else interaction.reply(Messages.playerPlaceInfo(playerdb));
            break;
          case "actOk":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else if (!playerdb?.isCurrent) interaction.reply(Messages.playerNotYourTurn);
            else {
              interaction.deferUpdate();
              sessiondb.nextPlayerStep();
            }
            break;
          case "actBuy":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else if (!playerdb?.isCurrent) interaction.reply(Messages.playerNotYourTurn);
            else if (!(playerdb.place instanceof PlaceEstate)) interaction.reply(Messages.errorIsNotEstate);
            else {
              interaction.deferUpdate();
              playerdb.lastActions.push(new Buy(playerdb, `You bought ${playerdb.place.name} for ${playerdb.currency.value(playerdb.place.price)}.`).act());
              sessiondb.nextPlayerStep(false);
            }
            break;
          case "actCasinoOk":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else if (!playerdb?.isCurrent) interaction.reply(Messages.playerNotYourTurn);
            else {
              interaction.deferUpdate();
              sessiondb.lastDice = Dice();
              const act = new Casino(playerdb, sessiondb.lastDice, `You won ${playerdb.currency.value(sessiondb.lastDice)}.`, "You lose. You won't get anything.");
              playerdb.lastActions.push(act);
              sessiondb.nextPlayerStep(false);
            }
            break;
          case "actCasinoNo":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else if (!playerdb?.isCurrent) interaction.reply(Messages.playerNotYourTurn);
            else {
              interaction.deferUpdate();
              sessiondb.nextPlayerStep(false);
            }
            break;
          case "actBuyNo":
            if (!playerdb || !sessiondb) interaction.reply(Messages.playerNotPlayer);
            else if (!playerdb?.isCurrent) interaction.reply(Messages.playerNotYourTurn);
            else {
              interaction.deferUpdate();
              sessiondb.nextPlayerStep(false);
            }
            break;
          default:
            interaction.deferUpdate();
            logger.logFail(`Unknown button: ${button_name}`);
            break;
        }
      }
    } catch (error) {
      if (interaction.isMessageComponent()) logger.logFail(chalk.red(error, interaction.customId));
      if (interaction.isCommand()) logger.logFail(chalk.red(error, interaction.commandName));
      if(interaction.isRepliable()) interaction.reply(Messages.error);
    }
  }
);

export { Bot, db, CommandsManager, Logger };