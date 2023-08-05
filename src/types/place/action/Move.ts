import { Place } from "../index.js";
import { Player } from "../../user/Player.js";
import { Action } from "./index.js";

export class Move extends Action {
  distination: Place;
  constructor(visitor: Player, distination: Place, description: string) {
    super(visitor, description);
    this.distination = distination;
  }
  act(): this {
    this.player.place = this.distination;
    return this;
  }
}