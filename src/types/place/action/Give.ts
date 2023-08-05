import { Action } from "./index.js";

export class Give extends Action {
  act(): this {
    this.player.money += this.player.session.moneyChest;
    this.player.session.moneyChest = 0;
    return this;
  }
}