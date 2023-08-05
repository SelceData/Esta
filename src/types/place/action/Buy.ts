import { Player } from "../../user/Player.js";
import { PlaceEstate } from "../PlaceEstate.js";
import { Action } from "./index.js";

export class Buy extends Action {
  estate: PlaceEstate;
  constructor(visitor: Player, description: string) {
    const estate = visitor.place as PlaceEstate;
    super(visitor, description);
    this.estate = estate;
    if (this.estate.isOwner(visitor)) throw new TypeError(`This place (${visitor.session.map.name}, ${visitor.place.name}) already has owner.`);
  }
  act(): this {
    if (this.player.currentPlaceBuyable) {
      this.player.money -= this.estate.price;
      this.player.estate.push(this.estate);
    }
    return this;
  }
}