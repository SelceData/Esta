import { Player } from "../../user/Player.js";
import { PlaceCasino } from "../PlaceCasino.js";
import { Action } from "./index.js";

export class Casino extends Action {
  dice: number;
  allowed: number[];
  constructor(player: Player, dice: number, descriptionWon: string, descriptionLose: string) {
    if (player.place instanceof PlaceCasino) {
      super(player, player.place.allowed.includes(dice) ? descriptionWon : descriptionLose);
      this.allowed = player.place.allowed;
      this.dice = dice;
    }
    else throw new Error(`Cuurent place is not casino: ${player.place.name}.`);
  }
  get won() {
    return this.allowed.includes(this.dice);
  }
  act(): this {
    if (this.won)
      this.player.session.moneyCasino += this.dice;
    return this;
  }
}