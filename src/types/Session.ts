import { Canvas } from "canvas";
import { CommandInteraction, Message, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import { GameMap, GameMapName } from "./GameMap.js";
import { db } from "../Bot.js";
import config from "../botconfig.json" assert { type: "json" };
import { Allocate } from "../utils/Allocate.js";
import { Choice, Dice, Shuffle } from "../utils/Random.js";
import { Player, PlayerColor, PlayerStatus } from "./user/Player.js";
import { MessageOptions, Messages } from "../components/Messages.js";
import { Drawable } from "./Drawable.js";
import { PlaceMessage } from "./place/PlaceMessage.js";
import DataBase from "../utils/DataBase.js";

export enum SessionJoinResult { Success, IsFull, NoColors, AlreadyJoined }
export enum SessionKickResult { Success, AllPlayersLeft, IsNotPlayer }

export enum SessionClosedReason {
  Unknown = "Reason is unknown.",
  Error = "Unknown error occured.",
  MessageDeleted = "Message have been deleted.",
  AllPlayersLeft = "All players left.",
}
export enum SessionStatus { Lobby, InGame, Closed }

interface ISessionOptions {
  map: GameMap;
  players: Player[];
  size: number;
  chest?: number;
  currentPlayer?: Player;
  message?: Message;
  messageSub?: Message;
}

export class Session extends Drawable {
  status: SessionStatus;
  readonly map: GameMap;
  message?: Message;
  moneyChest: number;
  moneyCasino = 0;
  /** Message for player actions. */
  messageSub?: Message;
  allPlayers: Player[];
  size: number;
  player?: Player;
  createdAt: Date;
  closedAt?: Date;
  closedReason?: SessionClosedReason;
  lastDice = -1;
  constructor(options: ISessionOptions) {
    super();
    this.status = SessionStatus.Lobby;
    this.map = options.map;
    this.message = options.message;
    this.messageSub = options.messageSub;
    this.moneyChest = options.chest ?? 0;
    this.allPlayers = options.players;
    this.size = Math.max(config.game.lobbySizeMin, Math.min(options.size, config.game.lobbySizeMax));
    this.player = Choice(this.allPlayers);
    this.createdAt = new Date;
  }
  static extract(db: DataBase, id: string): Session | undefined {
    return db.data.sessions.get(id);
  }
  static async create(db: DataBase, interaction: ModalSubmitInteraction | CommandInteraction | MessageComponentInteraction): Promise<Session> {
    const session = new Session({ message: await interaction.deferReply({ fetchReply: true }), map: GameMap.pack[config.game.mapDefault as GameMapName], players: [], size: config.game.lobbySizeDefault });
    db.data.sessions.set(session.id, session);
    return session;
  }
  get id() { if(this.message?.id) return this.message.id; else throw new Error("Unknown session has not message. Can not get own id."); }
  get usedColors(): PlayerColor[] { return this.allPlayers.map(player => player.color); }
  get availableColors(): PlayerColor[] { return Object.values(PlayerColor).filter(color => !this.usedColors.includes(color)); }
  get allPlayersReady(): Player[] {
    return this.allPlayers.filter(player => player.status == PlayerStatus.Ready);
  }
  get isFull(): boolean {
    return this.size <= this.allPlayers.length;
  }
  kick(player: Player): SessionKickResult {
    if (!this.allPlayers.includes(player)) return SessionKickResult.IsNotPlayer;
    this.allPlayers.splice(this.allPlayers.indexOf(player), 1);
    if(this.allPlayers.length < 1) return SessionKickResult.AllPlayersLeft;
    if(this.allPlayers.length > 1) this.nextPlayerStep();
    return SessionKickResult.Success;
  }
  join(player: Player): SessionJoinResult {
    if (this.allPlayers.includes(player)) return SessionJoinResult.AlreadyJoined;
    if (this.isFull) return SessionJoinResult.IsFull;
    const suggestedColor = this.availableColors[0];
    if (!suggestedColor) return SessionJoinResult.NoColors;
    player.color = suggestedColor;
    this.allPlayers.push(player);
    player.estate = [];
    player.money = config.game.userStartMoney;
    player.session = this;
    return SessionJoinResult.Success;
  }
  async close(reason: SessionClosedReason | Error): Promise<Message | void> {
    if (this.closedReason !== undefined) return;
    const channel = this.message?.channel ?? this.messageSub?.channel;
    if(this.message?.deletable) {
      this.message.delete();
      db.data.sessions.delete(this.message.id);
    }
    if(this.messageSub?.deletable) {
      this.messageSub.delete();
      db.data.sessions.delete(this.messageSub.id);
    }
    this.message = await channel?.send(Messages.sessionClosed(this));
    this.status = SessionStatus.Closed;
    if (reason instanceof Error)
      this.closedReason = SessionClosedReason.Error;
    this.closedAt = new Date();
    return this.message;
  }
  /**
   * @see {@link Session.nextPlayerStep}.
   */
  async start() {
    this.status = SessionStatus.InGame;
    this.allPlayers = Shuffle(this.allPlayers);
    this.allPlayers.forEach(player => player.status = PlayerStatus.Playing);
    return await this.nextPlayerStep();
  }
  /**
   * @returns New messages and player steps.
   */
  async nextPlayerStep() {
    this.lastDice = Dice();
    this.player = this.allPlayers[(this.allPlayers.filter(p => p.status !== PlayerStatus.Dead).indexOf(this.player ?? this.allPlayers[0]) + 1) % this.allPlayers.length];
    if (!this.player) throw new Error("Can not get next player.");

    this.player.step();
    this.updateMessageSub();
    this.updateMessage();
    return { message: this.message as Message, submessage: this.messageSub as Message, distance: this.lastDice };
  }
  async updateMessage(): Promise<Message | void> {
    if (this.message?.editable) {
      if (this.status == SessionStatus.Lobby)
        this.message.edit(Messages.sessionInLobby(this));
      else if(this.status == SessionStatus.InGame)
        this.message.edit(await Messages.sessionInGame(this));
      else if(this.status == SessionStatus.Closed)
        this.message.edit(Messages.sessionClosed(this));
    } else {
      this.close(SessionClosedReason.MessageDeleted);
    }
    return this.message;
  }
  async updateMessageSub(): Promise<Message | void> {
    if (this.message && this.player) {
      let msgopts: MessageOptions = Messages.playerActed(this.player);
      if (this.player.place instanceof PlaceMessage && (this.player.place.onEnterMessage != "playerBuyQuestion" || this.player.currentPlaceBuyable))
        msgopts = Messages[this.player.place.onEnterMessage](this.player);
      if(!this.messageSub) {
        this.messageSub = await this.message.reply(msgopts);
        db.data.sessions.set(this.messageSub.id, this);
      } else if (this.messageSub.editable) {
        if (this.status == SessionStatus.InGame)
          this.messageSub.edit(msgopts);
        if (this.status == SessionStatus.Closed)
          this.messageSub.edit(Messages.sessionClosed(this));
      }
    } else this.close(SessionClosedReason.MessageDeleted);
    return this.messageSub;
  }
  async getImage() {
    const padding = 20;
    const tilePadding = 8;
    const tileSize = 86;
    const tileBorder = 2;
    const tileCorner = 10;
    const tileCornerPadding = 3;
    const tileCount = this.map.places.length;
    const tileCountLR = Math.floor(tileCount / 4);
    const tileCountTB = Math.ceil(tileCount / 4);
    if (tileCount % 2 != 0) throw new Error(`Invalid map place count: ${this.map.name} - ${tileCount}.`);
    const sizeV = (tileCountLR + 1) * tileSize + padding * 2 + tileBorder * 2;
    const sizeH = (tileCountTB + 1) * tileSize + padding * 2 + tileBorder * 2;
    const canvas = new Canvas(sizeH, sizeV);
    const ctx = canvas.getContext("2d");


    // top-left corner
    let x = padding;
    let y = padding;

    for (let placeIndex = 0; placeIndex < this.map.places.length; placeIndex++) {
      const place = this.map.places[placeIndex];
      //
      // side definition
      //
      enum TileSide { Unknown, LeftTop, Top, RightTop, Right, RightBottom, Bottom, LeftBottom, Left }
      let side = TileSide.Unknown;
      if (placeIndex > tileCountTB * 2 + tileCountLR) side = TileSide.Left;
      else if (placeIndex == tileCountTB * 2 + tileCountLR) side = TileSide.LeftBottom;
      else if (placeIndex > tileCountTB + tileCountLR) side = TileSide.Bottom;
      else if (placeIndex == tileCountTB + tileCountLR) side = TileSide.RightBottom;
      else if (placeIndex > tileCountTB) side = TileSide.Right;
      else if (placeIndex == tileCountTB) side = TileSide.RightTop;
      else if (placeIndex > 0) side = TileSide.Top;
      else if (placeIndex == 0) side = TileSide.LeftTop;

      //
      // drawing tiles
      //
      {
        interface ITextOptions {
          position: "top" | "middle" | "bottom",
          align: "left" | "center" | "right",
          color?: string,
          font?: string
        }
        function text(content: string, options: ITextOptions) {
          ctx.fillStyle = options.color ?? "black";
          ctx.font = options.font ?? "10px Arial";
          let textX = 0;
          ctx.textAlign = options.align;
          if (options.align == "left") { textX = x + tilePadding; }
          else if (options.align == "center") { textX = x + tileSize / 2; }
          else if (options.align == "right") { textX = x + tileSize - tilePadding; }
          let textY = 0;
          if (options.position == "top") { ctx.textBaseline = "top"; textY = y + tilePadding; }
          else if (options.position == "middle") { ctx.textBaseline = "middle"; textY = y + tileSize / 2; }
          else if (options.position == "bottom") { ctx.textBaseline = "bottom"; textY = y + tileSize - tilePadding; }
          ctx.fillText(content, textX, textY, tileSize - tilePadding * 2);
        }
        const drawopts = place.getDrawOptions(this);
        /* drawing background */
        if (drawopts.background instanceof Promise) {
          ctx.drawImage(await drawopts.background, x, y);
        } else if (Array.isArray(drawopts.background)) {
          const gradient = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
          for (let i = 0; i < drawopts.background.length; i++) {
            const color = drawopts.background[i];
            gradient.addColorStop(i / drawopts.background.length, color);
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, tileSize, tileSize);
        } else {
          ctx.fillStyle = drawopts.background ?? "white";
          ctx.fillRect(x, y, tileSize, tileSize);
        }

        /* drawing subbackground */
        if (drawopts.subbackground) {
          ctx.fillStyle = drawopts.subbackground;
          if ([TileSide.Left, TileSide.LeftBottom, TileSide.LeftTop].includes(side)) ctx.fillRect(x, y, tileSize / 3, tileSize);
          if ([TileSide.Bottom, TileSide.LeftBottom, TileSide.RightBottom].includes(side)) ctx.fillRect(x, y + tileSize, tileSize, tileSize / -3);
          if ([TileSide.Right, TileSide.RightBottom, TileSide.RightTop].includes(side)) ctx.fillRect(x + tileSize, y, tileSize / -3, tileSize);
          if ([TileSide.Top, TileSide.LeftTop, TileSide.RightTop].includes(side)) ctx.fillRect(x, y, tileSize, tileSize / 3);
        }
        /* drawing text */
        [drawopts.top, drawopts.middle, drawopts.bottom].forEach((drawo, drawoIndex) => {
          const drawoPos = (["top", "middle", "bottom"] as ITextOptions["position"][])[drawoIndex];
          if (typeof drawo == "string") {
            text(drawo, { position: drawoPos, align: "center" });
          } else if (typeof drawo == "object") {
            text(drawo.text, { position: drawoPos, align: drawo.align ?? "center", color: drawo.color, font: drawo.font });
          }
        });
        /* drawing cornerground */
        if (drawopts.corners) {
          ctx.strokeStyle = drawopts.corners;
          const tp = tileCornerPadding;
          const tc = tileCornerPadding + tileCorner;

          const corners = [[tp, tp], [tileSize - tp, tp], [tp, tileSize - tp], [tileSize - tp, tileSize - tp]];

          for (const [cornerX, cornerY] of corners) {
            ctx.beginPath();
            ctx.moveTo(x + cornerX, y + cornerY);
            ctx.lineTo(x + cornerX + (cornerX === tp ? tc : -tc), y + cornerY);
            ctx.moveTo(x + cornerX, y + cornerY);
            ctx.lineTo(x + cornerX, y + cornerY + (cornerY === tp ? tc : -tc));
            ctx.stroke();
            ctx.closePath();
          }
        }
        /* drawing border */
        if (this.player?.place === place) {
          ctx.strokeStyle = this.player.color;
          ctx.lineWidth = tileBorder;
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }

      //
      // drawing players
      //
      const placePlayers = place.ownPlayers(this);
      if (placePlayers.length > 0) {
        const size = 28;
        const [cx, cy] = [x + tileSize / 2, y + tileSize / 2];
        const allocated = Allocate(placePlayers.length, cx, cy, size);
        const avatars = await Promise.all(placePlayers.map((player: Player) => player.avatar));
        for (const player of placePlayers) {
          const playerIndex = placePlayers.indexOf(player);
          const playerAvatar = avatars[playerIndex];
          const [pointX, pointY] = allocated[playerIndex];
          /* drawing avatar border */
          ctx.fillStyle = player.color;
          ctx.strokeStyle = player.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pointX, pointY, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.save();
          ctx.clip();
          ctx.drawImage(playerAvatar, pointX - size / 2, pointY - size / 2, size, size);
          ctx.restore();
          ctx.stroke();
          ctx.closePath();
        }
      }

      //
      // Next tile coordinates changing
      //
      if (side === TileSide.Left || side === TileSide.LeftBottom) y -= tileSize + tileBorder;
      else if (side === TileSide.Bottom || side === TileSide.RightBottom) x -= tileSize + tileBorder;
      else if (side === TileSide.Right || side === TileSide.RightTop) y += tileSize + tileBorder;
      else if (side === TileSide.Top || side === TileSide.LeftTop) x += tileSize + tileBorder;
    }
    return canvas;
  }
}