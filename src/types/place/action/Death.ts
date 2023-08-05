import { Player } from "../../user/Player.js";
import { Action } from "./index.js";

export class Death extends Action {
  constructor(visitor: Player, description: string) {
    super(visitor, description);
  }
  act(): this {
    this.player.kill();
    return this;
  }
}