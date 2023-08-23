import { APIEmbed, Attachment, userMention } from "discord.js";
import { Session } from "../types/Session.js";
import { APIRow, Row } from "./Row.js";
import { Embeds } from "./Embeds.js";
import { Player } from "../types/user/Player.js";
import { Buttons } from "./Buttons.js";

export interface MessageOptions {
  content?: string,
  embeds?: APIEmbed[],
  components?: APIRow[],
  ephemeral?: boolean,
}

export type MessageCallerEmpty = () => MessageOptions
export type MessageCallerSession = (session: Session) => MessageOptions
export type MessageAsyncCallerSession = (session: Session) => Promise<MessageOptions>
export type MessageCallerPlayer = (session: Player) => MessageOptions
export type MessageOptionsContainer = MessageOptions | MessageCallerEmpty | MessageCallerPlayer | MessageCallerSession | MessageAsyncCallerSession;

export const Messages = {
  error: { content: "There was an error while executing this interaction!", ephemeral: true },
  errorIsNotEstate: { content: "You can't buy this place.", ephemeral: true },
  sessionInLobby(session: Session) { return { embeds: [Embeds.sessionInLobby(session)], components: [Row(Buttons.joinLeave, Buttons.ready)] }; },
  async sessionInGame(session: Session) { return { embeds: [Embeds.sessionInfo(session), Embeds.gameRender], components: [Row(Buttons.myPlace, Buttons.leave)], files: [await session.getAttachment()] }; },
  sessionClosed(session: Session, error?: Error) { if (error) console.log(error); return { content: "", embeds: [Embeds.sessionClosed(session, error)], components: [], files: [] }; },
  playerPlaceInfo(player: Player) { return { embeds: [Embeds.playerPlaceInfo(player)], files: [], ephemeral: true }; },
  playerActed(player: Player) { return { content: userMention((player.session.player as Player).person.id), embeds: [Embeds.playerActed(player)], components: [Row(Buttons.actOk)], files: [] }; },
  playerBuyQuestion(player: Player) { return { content: userMention((player.session.player as Player).person.id), embeds: [Embeds.playerBuyQuestion(player)], components: [Row(Buttons.actBuy, Buttons.actBuyNo)], files: [] }; },
  playerCasinoQuestion(player: Player) { return { content: userMention((player.session.player as Player).person.id), embeds: [Embeds.playerCasinoQuestion(player)], components: [Row(Buttons.actCasinoOk, Buttons.actCasinoNo)], files: [] }; },
  playerNotPlayer: { content: "You are not player.", ephemeral: true },
  playerLobbyIsFull: { content: "The lobby is full.", ephemeral: true },
  playerNoColors: { content: "Can't join. All colors are busy.", ephemeral: true },
  playerNotYourTurn: { content: "Not your turn.", ephemeral: true },
  commandNotImplemented: { content: "Command not implemented.", ephemeral: true },
};

export type MessageCallablePlayerName = { [K in keyof typeof Messages]: typeof Messages[K] extends (player: Player) => unknown ? K : never }[keyof typeof Messages];
export type MessageName = keyof typeof Messages;
export type MessageCallableName = { [K in keyof typeof Messages]: typeof Messages[K] extends Function ? K : never }[keyof typeof Messages];
export type MessageNotCallableName = Exclude<MessageName, MessageCallableName>;