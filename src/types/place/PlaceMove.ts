import { Move } from "./action/Move.js";
import { IPlaceDrawOptions, IPlaceOptions, Place } from "./index.js";
import { Player } from "../user/Player.js";
import { GameMap } from "../GameMap.js";
import { Session } from "../Session.js";

export interface IPlaceMoveOptions extends IPlaceOptions {
  move: number
}

/**Moves the player to the next `PlaceMove` instance, ignoring `move - 1` `PlaceMove` instances.*/
export class PlaceMove extends Place {
  move: number;
  constructor(name: string, options: IPlaceMoveOptions) {
    super(name, { description: options.description });
    this.move = options.move;
  }
  getDrawOptions(session: Session): IPlaceDrawOptions {
    const dist = this.getDistination(session.map);
    return {
      background: "#d0d0d0",
      middle: this.name,
      bottom: { text: dist == this ? "" : `→ ${dist.name}` }
    };
  }
  getDistination(map: GameMap): PlaceMove {
    let place: PlaceMove | undefined;
    if (this.move == 0)
      return this;
    else
      for (let i = 0; i < this.move + 1; i++) {
        place = this.nextPlace(map, (place) => place instanceof PlaceMove) as PlaceMove;
      }
    if (place) {
      return place;
    } else throw new Error(`Next instance not found after ${this.name} (${this.ownIndex(map)})`);
  }
  onEnter(player: Player): void {
    if (this.move < 1) return;
    const distPlace = this.getDistination(player.session.map);
    player.lastActions.push(new Move(player, this, `You got to ${this.name}.`).act());
    player.lastActions.push(new Move(player, distPlace, `Now you are in ${distPlace.name}.`).act());
  }
  onCross(): void {
    //
  }
}