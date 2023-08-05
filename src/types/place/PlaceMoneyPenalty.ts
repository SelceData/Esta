import { IPlaceDrawOptions, IPlaceOptions, Place } from "./index.js";
import { MoneyPenalty } from "./action/MoneyPenalty.js";
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
      background: "#d0f0d0",
      middle: session.map.currency.value(this.value)
    };
  }
  onEnter(player: Player): void {
    player.lastActions.push(new MoneyPenalty(player, this.value, `You lost ${player.currency.value(this.value)}.`).act());
  }
}