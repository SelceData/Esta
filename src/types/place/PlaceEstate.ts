import config from "../../botconfig.json" assert { type: "json" };
import { Rent } from "./action/Rent.js";
import { GroupType } from "./Group.js";
import { IPlaceDrawOptions, IPlaceOptions, Place } from "./index.js";
import { Player } from "../user/Player.js";
import { Session } from "../Session.js";
import { GameMap } from "../GameMap.js";
import { Death } from "./action/Death.js";
import { PlaceMessage } from "./PlaceMessage.js";
import { MessageCallablePlayerName } from "../../components/Messages.js";

export interface IPlaceEstateOptions extends Omit<IPlaceOptions, "onEnter" | "onCross"> {
  price: number;
  group: GroupType;
}

/**
 * {@link Place} that can be bought. Must belong to a {@link GroupType group}.
 */
export class PlaceEstate extends PlaceMessage {
  onEnterMessage: MessageCallablePlayerName = "playerBuyQuestion";
  groupName: GroupType;
  price: number;
  constructor(name: string, options: IPlaceEstateOptions) {
    super(name, { description: options.description });
    this.groupName = options.group;
    this.price = options.price;
  }
  getDrawOptions(session: Session): IPlaceDrawOptions {
    return {
      background: this.getOwner(session)?.color,
      subbackground: this.getGroup(session.map)?.color,
      middle: this.name,
      bottom: { text: session.map.currency.value(this.price), align: "left" }
    };
  }
  getGroup(map: GameMap) {
    return map.getGroup(this);
  }
  isOwner(player: Player): boolean {
    return player.estate.includes(this);
  }
  getOwner(session: Session): Player | undefined {
    return session.allPlayers.find(player => player.estate.includes(this));
  }
  getRentPrice(session: Session): number {
    const owner = this.getOwner(session);
    if (owner instanceof Player) {
      const group = owner.session.map.getGroup(this);
      const priceMod = group?.hasAll?.(
        owner.estate.filter(est => owner instanceof Player ? owner.session.map.getGroup(est) == group : false) as Place[]
      )
        ? config.game.rentModFullSet : config.game.rentModDefault;
      return this.price != undefined && this.price >= 0 ? this.price * priceMod * owner.session.map.currency.rate : 0;
    } else throw new Error("Current place has not owner.");
  }
  onEnter(player: Player) {
    const owner = this.getOwner(player.session);
    if (owner instanceof Player) {
      const rent = this.getRentPrice(player.session);
      if (rent > player.money) {
        player.lastActions.push(new Death(player, `You have to pay ${player.currency.value(rent)} to ${owner.person.name}, buy you don't have money (${player.currency.value(rent - player.money)}).`).act());
      }
      else
        player.lastActions.push(new Rent(player, `You paid ${player.currency.value(rent)} to ${owner.person.name}.`).act());
    }
  }
  onCross(): void {
    //
  }
}