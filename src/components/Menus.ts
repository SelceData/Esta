import { APIStringSelectComponent, ComponentType } from "discord.js";
import config from "../botconfig.json" assert { type: "json" };

export type MenuName = "playersCount";
export interface APIMenu extends APIStringSelectComponent { custom_id: MenuName }
export const Menus: Record<MenuName, APIMenu> = {
  playersCount: {
    custom_id: "playersCount",
    type: ComponentType.StringSelect,
    options: new Array(config.game.lobbySizeMax - config.game.lobbySizeMin - 1).fill(config.game.lobbySizeMin).map(
      (initial, n) => ({
        value: `${n + initial}`,
        label: `${n + initial}`,
        default: n + initial === config.game.lobbySizeDefault
      })
    ),
  },
};