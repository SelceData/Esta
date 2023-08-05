import { BaseImageURLOptions, GuildMember, User } from "discord.js";
import { Session } from "../Session.js";
import { GameMapName } from "../GameMap.js";
import { loadImage } from "canvas";
import DataBase from "../../utils/DataBase.js";

export interface IBest {
  wins: number,
  loses: number,
  money: number,
}

export class Person {
  private user: User | GuildMember;
  getAvatar(size: BaseImageURLOptions["size"] = 32) {
    return loadImage(this.user.displayAvatarURL({ extension: "jpg", size: size, forceStatic: true }));
  }
  allSessions: Set<Session>;
  best?: {
    [key in GameMapName]: IBest
  };

  constructor(user: User) {
    this.user = user;
    this.allSessions = new Set<Session>();
  }
  static extract(db: DataBase, user: User): Person | undefined {
    return db.data.persons.get(user.id);
  }
  static create(db: DataBase, user: User): Person {
    const person = new Person(user);
    db.data.persons.set(person.id, person);
    return person;
  }
  get discord(): User | GuildMember {
    return this.user;
  }
  get id(): string {
    return this.user.id;
  }
  get name(): string {
    return this.user instanceof User ? this.user.username : this.user.displayName;
  }
}