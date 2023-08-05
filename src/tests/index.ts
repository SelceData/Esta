import chalk from "chalk";
import assert from "node:assert";
import dotenv from "dotenv";
import { Buttons } from "../components/Buttons.js";
import { Inputs } from "../components/Inputs.js";
import { Menus } from "../components/Menus.js";
import { Modals } from "../components/Modals.js";
import { GameMap } from "../types/GameMap.js";
import { Session } from "../types/Session.js";
import { LoggerModes, isLoggerMode } from "../utils/Logger.js";

dotenv.config();

describe("Environment", function () {
  it("TOKEN should be defined", function () { assert(process.env.TOKEN); });
  it("APPID should be defined", function () { assert(process.env.APPID); });
  it(`LOGS{${process.env.LOGS}} should be ${LoggerModes.map(v => chalk.green(`"${v}"`)).join(", ")}`, function () { assert(isLoggerMode(process.env.LOGS)); });
});
describe("./types/GameMap", function () {
  Object.values(GameMap.pack).forEach(map => {
    describe(map.name, function () {
      it(`.${chalk.cyanBright("places")}.${chalk.cyanBright("length")}{${chalk.greenBright(map.places.length)}} should be even`, function () { assert.strictEqual(map.places.length % 2, 0); });
      map.places.forEach((place, placeIndex) => {
        it(`.${chalk.cyanBright("places")}[${placeIndex}]{${place.name}} size should not have empty ${chalk.yellow("getDrawOptions")} ${chalk.magenta("return")}`, function () { assert(Object.keys(place.getDrawOptions(new Session({ map: map, players: [], size: 0 }))).length > 0); });
      });
    });
  });
});
Object.entries({ Buttons, Inputs, Menus, Modals }).forEach(([group, groupComponents]) => {
  describe(`./components/${group}`, function () {
    Object.entries(groupComponents).forEach(
      ([id, component]) => {
        it(`.${chalk.cyanBright(id)}.${chalk.cyanBright("custom_id")}{${chalk.green(`"${id}"`)}} should be ${chalk.green(`"${id}"`)}`, function () { assert.strictEqual(component.custom_id, id); });
      }
    );
  });
});