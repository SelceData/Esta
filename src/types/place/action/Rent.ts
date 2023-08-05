import { Player } from "../../user/Player.js";
import { PlaceEstate } from "../PlaceEstate.js";
import { Action } from "./index.js";

export class Rent extends Action {
  money: number;
  renter: Player;
  constructor(visitor: Player, description: string) {
    const place = visitor.place as PlaceEstate;
    const owner = place.getOwner(visitor.session);
    const money = place.getRentPrice(visitor.session);
    if (owner instanceof Player && money) {
      super(visitor, description);
      this.money = money;
      this.renter = owner;
    } else throw new TypeError(`This place (${visitor.session.map.name}, ${visitor.place.name}) has not owner and player can not rent.`);
  }
  act(): this {
    this.player.money -= this.money;
    this.renter.money += this.money;
    return this;
  }
}