import { GameMap } from "../GameMap.js";
import config from "../../botconfig.json" assert { type: "json" };
import { Person } from "./Person.js";
import { PlaceEstate } from "../place/PlaceEstate.js";
import { Place } from "../place/index.js";
import { Session, SessionJoinResult, SessionKickResult } from "../Session.js";
import { Action } from "../place/action/index.js";
import { User } from "discord.js";
import { Image } from "canvas";
import DataBase from "../../utils/DataBase.js";

export enum PlayerStatus { Ready, Idle, Playing, Dead }

export interface IPlayerOptions {
  session: Session,
  person: Person,
  money?: number,
  estate?: PlaceEstate[],
  status?: PlayerStatus,
}

export enum PlayerColor {
  turquoise = "turquoise",
  brown = "brown",
  navy = "navy",
  lavender = "lavender",
  indigo = "indigo",
  peach = "peach",
  pink = "pink",
  teal = "teal",
}

export class Player {
  person: Person;
  session: Session;
  money: number;
  estate: PlaceEstate[];
  status: PlayerStatus;
  place: Place;
  color = PlayerColor.indigo;
  lastActions: Action[] = [];
  avatar: Promise<Image>;
  lastStep = 0;
  constructor(param: IPlayerOptions) {
    this.person = param.person;
    this.avatar = this.person.getAvatar();
    this.session = param.session;
    this.money = param.money ?? config.game.userStartMoney;
    this.estate = param.estate ?? [];
    this.status = param.status ?? PlayerStatus.Idle;
    this.place = this.session.map.places[0];
  }
  static extract(session: Session, user: User): Player | undefined {
    return session.allPlayers.find(player => player.person.id == user.id);
  }
  static create(db: DataBase, session: Session, user: User): Player {
    return new Player({ session: session, person: Person.extract(db, user) ?? Person.create(db, user) });
  }
  get currentPlaceBuyable(): boolean {
    return this.place instanceof PlaceEstate && this.place.price <= this.money && !this.place.isOwner(this);
  }
  get allEstatePrice(): number {
    return this.estate.reduce((val, est) => val + est.price, 0);
  }
  get isCurrent(): boolean {
    return this.session.player === this;
  }
  get currency() {
    return this.session.map.currency;
  }
  get lastDice() {
    return this.session.lastDice;
  }
  kick(): SessionKickResult {
    return this.session.kick(this);
  }
  kill(): void {
    this.status = PlayerStatus.Dead;
  }
  join(session: Session): SessionJoinResult {
    return session.join(this);
  }
  step(resetLastActions: boolean = false) {
    if (this.session.map instanceof GameMap) {
      this.lastStep = this.lastDice;
      if (resetLastActions)
        this.lastActions = [];
      for (let i = 0; i < this.lastDice - 1; i++) {
        this.place = this.place?.nextPlace(this.session.map) as Place;
        this.place.onCross?.(this); // adds elements to lastActions
      }
      this.place = this.place?.nextPlace(this.session.map) as Place;
      this.place.onEnter?.(this); // adds elements to lastActions
      this.place.onCross?.(this); // adds elements to lastActions
    } else throw new Error("Unknown map.");
  }
}