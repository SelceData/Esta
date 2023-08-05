import { Player } from "../../user/Player.js";

export abstract class Action {
  private _player: Player;
  get player(): Player {
    return this._player;
  }
  private _description: string;
  get description(): string {
    return this._description;
  }
  constructor(player: Player, description: string) {
    this._player = player;
    this._description = description;
  }
  abstract act(): typeof this;
}