import { IPlaceDrawOptions, IPlaceOptions, Place } from "./index.js";
import { MoneyBonus } from "./action/MoneyBonus.js";
import { Player } from "../user/Player.js";
import { Session } from "../Session.js";

export class PlaceLap extends Place {
  readonly value: number;
  constructor(value: number, options: IPlaceOptions) {
    super("", { description: options.description });
    this.value = value;
  }
  getDrawOptions(session: Session): IPlaceDrawOptions {
    return {
      corners: "#80f080",
      background: ["#50b050", "#208020"],
      middle: session.map.currency.value(this.value)
    };
  }
  onCross(player: Player): void {
    player.lastActions.push(new MoneyBonus(player, this.value, `You got ${player.currency.value(this.value)}.`).act());
  }
}