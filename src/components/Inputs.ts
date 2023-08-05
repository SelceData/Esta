import { APITextInputComponent, TextInputStyle, ComponentType } from "discord.js";
import config from "../botconfig.json" assert { type: "json" };

export type InputName = "doNotUseThisInputOrYouWillBeFired";
export interface APIInput extends APITextInputComponent { custom_id: InputName }
export const Inputs: Record<InputName, APIInput> = {
  doNotUseThisInputOrYouWillBeFired: { custom_id: "doNotUseThisInputOrYouWillBeFired", style: TextInputStyle.Paragraph, label: "Information", value: `Players limit: ${config.game.lobbySizeDefault}\nDefault map: ${config.game.mapDefault}`, type: ComponentType.TextInput },
};