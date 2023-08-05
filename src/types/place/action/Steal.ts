import { Action } from "./index.js";

export class Steal extends Action {
  act(): this {
    this.player.session.moneyChest += this.player.money;
    this.player.money = 0;
    return this;
  }
}