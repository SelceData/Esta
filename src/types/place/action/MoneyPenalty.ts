import { MoneyBonus } from "./MoneyBonus.js";

export class MoneyPenalty extends MoneyBonus {
  act(): this {
    this.player.money -= this.money;
    return this;
  }
}