import {
  ComponentType,
  APIActionRowComponent,
  APIMessageActionRowComponent} from "discord.js";
import { APIButton } from "./Buttons.js";
import { APIMenu } from "./Menus.js";

export type APIRow = APIActionRowComponent<APIMessageActionRowComponent>;
export type APIRowComponent = APIMenu | APIButton;

export function Row(...components: APIRowComponent[]) {
  return {
    components: components,
    type: ComponentType.ActionRow
  } as APIRow;
}