import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import config from "../botconfig.json" assert { type: "json" };

export type CommandName = "start" | "profile";
export interface APICommand extends RESTPostAPIChatInputApplicationCommandsJSONBody { name: CommandName }
export const Commands: Record<CommandName, APICommand> = {
  start: {
    name: "start",
    name_localizations: { "ru": "запуск", "uk": "запуск" },
    description: "Create a lobby.",
    description_localizations: { "ru": "Создать игровую комнату.", "uk": "Створити лобі." },
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "max_players",
        name_localizations: { "ru": "лимит_игроков", "uk": "ліміт_гравців" },
        description: "Maximum amount of players. Default: 4.",
        description_localizations: { "ru": "Лимит количества игроков. По умолчанию: 4.", "uk": "Ліміт кількості гравців. Типово: 4." },
        min_value: config.game.lobbySizeMin,
        max_value: config.game.lobbySizeMax
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "map",
        name_localizations: { "ru": "карта", "uk": "мапа" },
        description: "Map to play on.",
        description_localizations: { "ru": "Карта для игры.", "uk": "Мапа для гри." },
        choices: [
          {
            name: "Ukraine",
            name_localizations: { "ru": "Украина", "uk": "Україна" },
            value: config.game.mapDefault
          }
        ],
      }
    ]
  },
  profile: {
    name: "profile",
    name_localizations: { "ru": "профиль", "uk": "профіль" },
    description: "Display player profile.",
    description_localizations: { "ru": "Показать профиль игрока.", "uk": "Показати профіль гравця." }
  }
};