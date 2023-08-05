import { Currency } from "./Currency.js";
import { Group, GroupType } from "./place/Group.js";
import { PlaceEstate } from "./place/PlaceEstate.js";
import { Place } from "./place/index.js";
import { PlaceMoneyBonus } from "./place/PlaceMoneyBonus.js";
import { PlaceMove } from "./place/PlaceMove.js";
import { PlaceChest } from "./place/PlaceChest.js";
import { PlaceBandits } from "./place/PlaceBandit.js";
import { PlaceLap } from "./place/PlaceLap.js";
import { PlaceCasino } from "./place/PlaceCasino.js";
import { PlaceBankrupt } from "./place/PlaceBankrupt.js";

export class GameMap {
  currency: Currency;
  places: Place[];
  name: string;
  constructor(name: string, currency: Currency, places: Place[]) {
    [this.name, this.currency, this.places] = [name, currency, places];
  }
  getGroup(place: PlaceEstate) {
    return this.groups.find(group => group.name == place.groupName);
  }
  static get pack() {
    return {
      UnatedStates: new GameMap(
        "Unated States",
        Currency.pack.Dollar(1000),
        [
        ]
      ),
      UnitedKingdom: new GameMap(
        "United Kingdom",
        Currency.pack.Pound(1000),
        [
        ]
      ),
      France: new GameMap(
        "France",
        Currency.pack.Euro(1000),
        [
        ]
      ),
      Japan: new GameMap(
        "Japan",
        Currency.pack.Yen(1000),
        [
        ]
      ),
      Ukraine: new GameMap(
        "Ukraine",
        Currency.pack.Dollar(1000),
        [
          new PlaceLap(1, { description: "You can get money when you complete a lap." }),
          new PlaceEstate("Grammarly", { group: GroupType.TechnologyAndIT, price: 20, description: "A digital writing assistant that provides grammar, spelling, and style suggestions." }),
          new PlaceEstate("SoftServe", { group: GroupType.TechnologyAndIT, price: 10, description: "A global software development company offering IT consulting, development, and outsourcing services." }),
          new PlaceEstate("TemplateMonster", { group: GroupType.TechnologyAndIT, price: 10, description: "An online marketplace for website templates, graphics, and other digital products." }),
          new PlaceMove("Railway station 1", { description: "A quick way to change location.", move: 1 }),
          new PlaceEstate("Rozetka ", { group: GroupType.TechnologyAndIT, price: 15, description: "One of Ukraine's largest e-commerce platforms, offering a wide range of products." }),
          new PlaceMoneyBonus(3, { description: "Here you can get a bonus." }),
          new PlaceChest("Secret chest", { description: "A stumbled chest. And it's not closed!" }),
          new PlaceEstate("DTEK", { group: GroupType.EnergyAndUtilities, price: 8, description: "A leading energy company involved in coal mining, power generation, and distribution." }),
          new PlaceEstate("Naftogaz", { group: GroupType.EnergyAndUtilities, price: 7.5, description: "The national oil and gas company of Ukraine, responsible for exploration, production, and distribution." }),
          new PlaceBankrupt("Bankrupt", { description: "You lose all your estate." }),
          new PlaceEstate("Ukrenergo", { group: GroupType.EnergyAndUtilities, price: 10, description: "The state enterprise that operates and manages the country's power transmission system." }),
          new PlaceMoneyBonus(2, { description: "Here you can get a bonus." }),
          new PlaceEstate("Ukrhydroenergo", { group: GroupType.EnergyAndUtilities, price: 5, description: "A state-owned hydropower company that operates several hydroelectric power plants." }),
          new PlaceEstate("MHP", { group: GroupType.AgricultureAndFood, price: 4, description: "A vertically integrated poultry producer and exporter, known for its flagship brand \"Nasha Ryaba.\"" }),
          new PlaceEstate("Kernel", { group: GroupType.AgricultureAndFood, price: 5, description: "A major agricultural company involved in grain and oilseed production, processing, and exports." }),
          new PlaceCasino("Casino", { allowed: [1, 3, 5], description: "Get your money." }),
          new PlaceMove("Railway station 2", { description: "A quick way to change location.", move: 0 }),
          new PlaceEstate("Farmak", { group: GroupType.AgricultureAndFood, price: 6, description: "The largest pharmaceutical manufacturer in Ukraine, producing a wide range of medications." }),
          new PlaceMoneyBonus(5, { description: "Here you can get a bonus." }),
          new PlaceEstate("Kyivkhlib", { group: GroupType.AgricultureAndFood, price: 3, description: "A leading bakery company in Ukraine, offering a variety of bread and baked goods." }),
          new PlaceBandits("Bandits", { description: "These guys are stressful." }),
          new PlaceEstate("Foxtrot", { group: GroupType.RetailAndConsumerGoods, price: 2, description: "A prominent electronics and home appliance retailer with a wide network of stores." }),
          new PlaceEstate("ATB Market", { group: GroupType.RetailAndConsumerGoods, price: 3, description: "One of Ukraine's largest supermarket chains, offering a broad range of food and household products." }),
          new PlaceMoneyBonus(1, { description: "Here you can get a bonus." }),
          new PlaceEstate("Epicentr", { group: GroupType.RetailAndConsumerGoods, price: 1, description: "- A retail chain that specializes in home improvement products, tools, and construction materials." }),
          new PlaceCasino("Casino", { allowed: [2, 4, 6], description: "Get your money." }),
          new PlaceEstate("Ukrposhta", { group: GroupType.RetailAndConsumerGoods, price: 1, description: "The national postal service of Ukraine, providing mail and courier services throughout the country." }),
        ]
      )
    };
  }
  groups = [
    new Group(GroupType.TechnologyAndIT, "green"),
    new Group(GroupType.EnergyAndUtilities, "blue"),
    new Group(GroupType.AgricultureAndFood, "red"),
    new Group(GroupType.RetailAndConsumerGoods, "yellow"),
  ];
}

export type GameMapName = keyof typeof GameMap.pack;