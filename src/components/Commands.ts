import { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

export type CommandName = "start" | "profile";
export interface APICommand extends RESTPostAPIChatInputApplicationCommandsJSONBody { name: CommandName }
export const Commands: Record<CommandName, APICommand> = {
  start: {
    name: "start",
    description: "Create a lobby."
  },
  profile: {
    name: "profile",
    description: "View user profile."
  }
};