import { Player } from "../../user/Player.js";
import { Action } from "./index.js";

export class Tax extends Action {
  taxValue: number;
  constructor(visitor: Player, tax: number, description: string) {
    super(visitor, description);
    this.taxValue = Math.max(0, Math.min(tax, 1));
  }
  act(): this {
    this.player.money -= this.player.allEstatePrice * this.taxValue;
    return this;
  }
}