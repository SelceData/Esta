import { APIModalInteractionResponseCallbackData, ComponentType } from "discord.js";
import { Inputs } from "./Inputs.js";

export type ModalName = "createLobby";
export interface APIModal extends APIModalInteractionResponseCallbackData { custom_id: ModalName }
export const Modals: Record<ModalName, APIModal> = {
  createLobby: {
    custom_id: "createLobby",
    title: "Create a lobby",
    components: [
      {
        components: [Inputs.doNotUseThisInputOrYouWillBeFired],
        type: ComponentType.ActionRow
      }
    ]
  }
};