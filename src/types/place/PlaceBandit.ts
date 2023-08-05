import { Player } from "../user/Player.js";
import { Steal } from "./action/Steal.js";
import { IPlaceDrawOptions, Place } from "./index.js";

export class PlaceBandits extends Place {
  getDrawOptions(): IPlaceDrawOptions {
    return {
      background: "#202020",
      middle: { text: this.name, color: "white" }
    };
  }
  onEnter(player: Player): void {
    player.lastActions.push(new Steal(player, `The bandits stole all your money (${player.currency.value(player.money)}).`).act());
  }
}