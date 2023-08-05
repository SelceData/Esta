import { Player } from "../../user/Player.js";
import { Action } from "./index.js";

export class MoneyBonus extends Action {
  money: number;
  constructor(visitor: Player, money: number, description: string) {
    super(visitor, description);
    this.money = money;
  }
  act(): this {
    this.player.money += this.money;
    return this;
  }
}