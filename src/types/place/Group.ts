import { Place } from "./index.js";

export enum GroupType {
  TechnologyAndIT = "Technology and IT",
  EnergyAndUtilities = "Energy and Utilities",
  AgricultureAndFood = "Agriculture and Food",
  RetailAndConsumerGoods = "Retail and Consumer Goods"
}
export type GroupColor = "green" | "blue" | "red" | "yellow" | "magenta" | "orange" | "purple" | "cyan";

export class Group extends Set {
  color: GroupColor;
  name: GroupType;
  constructor(name: GroupType, color: GroupColor, values?: Place[]) {
    super(values);
    this.name = name;
    this.color = color;
  }
  hasAll(values: Place[]): boolean {
    return values.every(v => this.has(v));
  }
}