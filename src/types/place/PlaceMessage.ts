import { MessageCallablePlayerName } from "../../components/Messages.js";
import { Place } from "./index.js";

export abstract class PlaceMessage extends Place {
  abstract onEnterMessage: MessageCallablePlayerName;
}