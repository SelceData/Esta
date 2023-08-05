import { GameMap } from "../GameMap.js";
import { Player } from "../user/Player.js";
import { Session } from "../Session.js";
import { Image } from "canvas";

export interface IPlaceDrawOptionsText {
  text: string,
  color?: string,
  font?: string,
  align?: "left" | "center" | "right"
}

export interface IPlaceDrawOptions {
  corners?: string,
  background?: string | string[] | Promise<Image>,
  subbackground?: string,
  middle?: string | IPlaceDrawOptionsText,
  top?: string | IPlaceDrawOptionsText,
  bottom?: string | IPlaceDrawOptionsText,
}

export interface IPlaceOptions {
  description?: string;
}

export abstract class Place {
  name: string;
  getDrawOptions(session: Session): IPlaceDrawOptions;
  getDrawOptions(): IPlaceDrawOptions { return {}; }
  description: string;
  constructor(name: string, options: IPlaceOptions) {
    this.name = name;
    this.description = options?.description ?? "";
  }
  onEnter(player: Player): void;
  onEnter(): void { /* empty */ }
  onCross(player: Player): void;
  onCross(): void { /* empty */ }

  ownIndex(map: GameMap) {
    return map.places.indexOf(this);
  }
  ownPlayers(session: Session) {
    return session.allPlayers.filter(player => player.place == this);
  }
  nextPlace(map: GameMap): Place
  nextPlace(map: GameMap, filter: (place: Place, index: number, memory: Place[]) => boolean): Place
  nextPlace(map: GameMap, filter?: (place: Place, index: number, memory: Place[]) => boolean): Place {
    const placeIndex = this.ownIndex(map);
    if (filter) {
      const memory: Place[] = [];
      const selection = map.places.slice(placeIndex + 1).concat(map.places.slice(0, placeIndex));
      const result = selection.find((place, placeIndex) => {
        const temp = filter(place, placeIndex, memory);
        memory.push(place);
        return temp;
      });
      if (!result)
        throw new Error(`Can not find the place with current filter: ${filter.toString()}`);
      return result;
    }
    else return map.places[(placeIndex + 1) % map.places.length];
  }
}