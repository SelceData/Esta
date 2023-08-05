import { Session } from "../Session.js";
import { Player } from "../user/Player.js";
import { Bankrupt } from "./action/Bankrupt.js";
import { IPlaceDrawOptions, Place } from "./index.js";

export class PlaceBankrupt extends Place {
  getDrawOptions(session: Session): IPlaceDrawOptions;
  getDrawOptions(): IPlaceDrawOptions {
    return {
      background: "#202020",
      middle: { text: this.name, color: "white" },
    };
  }
  onEnter(player: Player): void {
    if(player.estate.length > 0)
      player.lastActions.push(new Bankrupt(player, `A random series of events led you to the fact that you lost all your estate (${player.estate.length}, ${player.currency.value(player.allEstatePrice)}).`).act());
    else
      player.lastActions.push(new Bankrupt(player, "If you owned estate, you would lose it."));
  }
}