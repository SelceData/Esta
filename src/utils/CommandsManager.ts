import { Routes, REST } from "discord.js";
import { Commands } from "../components/Commands.js";

const rest = new REST({ version: "10" });

export function put(token: string, appId: string) {
  return rest.setToken(token).put(Routes.applicationCommands(appId), { body: Object.values(Commands) });
}