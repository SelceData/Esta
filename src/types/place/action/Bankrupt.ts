import { Action } from "./index.js";

export class Bankrupt extends Action {
  act(): this {
    this.player.estate.length = 0;
    return this;
  }
}