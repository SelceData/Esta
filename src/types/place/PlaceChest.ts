import { Session } from "../Session.js";
import { Player } from "../user/Player.js";
import { Steal } from "./action/Steal.js";
import { IPlaceDrawOptions, Place } from "./index.js";

export class PlaceChest extends Place {
  getDrawOptions(session: Session): IPlaceDrawOptions {
    return {
      background: ["#ff5000", "#ff9000"],
      middle: this.name,
      bottom: { text: session.map.currency.value(session.moneyChest), align: "center" }
    };
  }
  onEnter(player: Player): void {
    player.lastActions.push(new Steal(player, `You got ${player.currency.value(player.session.moneyChest)}.`).act());
  }
}