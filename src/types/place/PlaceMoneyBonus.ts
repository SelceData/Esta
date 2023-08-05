import { IPlaceDrawOptions, IPlaceOptions, Place } from "./index.js";
import { MoneyBonus } from "./action/MoneyBonus.js";
import { Player } from "../user/Player.js";
import { Session } from "../Session.js";

export class PlaceMoneyBonus extends Place {
  readonly value: number;
  constructor(value: number, options: IPlaceOptions) {
    super("", { description: options.description });
    this.value = value;
  }
  getDrawOptions(session: Session): IPlaceDrawOptions {
    return {
      background: ["#f0f0b0", "#f0b0b0", "#b0f0f0"],
      middle: session.map.currency.value(this.value)
    };
  }
  onEnter(player: Player): void {
    player.lastActions.push(new MoneyBonus(player, this.value, `You got ${player.currency.value(this.value)}.`).act());
  }
}