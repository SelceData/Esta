import { MessageCallablePlayerName } from "../../components/Messages.js";
import { PlaceMessage } from "./PlaceMessage.js";
import { IPlaceDrawOptions, IPlaceOptions } from "./index.js";

export interface IPlaceCasinoOptions extends IPlaceOptions {
  allowed: number[]
}

export class PlaceCasino extends PlaceMessage {
  onEnterMessage: MessageCallablePlayerName = "playerCasinoQuestion";
  allowed: number[];
  constructor(name: string, options: IPlaceCasinoOptions) {
    super(name, { description: options.description });
    this.allowed = options.allowed;
  }
  getDrawOptions(): IPlaceDrawOptions {
    return {
      background: ["#f0f0b0", "#f0b0b0", "#b0f0f0"],
      middle: this.name
    };
  }
}