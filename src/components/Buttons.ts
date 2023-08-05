import { APIButtonComponentWithCustomId, ButtonStyle, ComponentType } from "discord.js";

export type ButtonName = "leave" | "joinLeave" | "ready" | "myPlace" | "actCasinoOk" | "actCasinoNo" | "actOk" | "actBuyNo" | "actBuy" | "actSell";
export interface APIButton extends APIButtonComponentWithCustomId { custom_id: ButtonName }
export const Buttons: Record<ButtonName, APIButton> = {
  leave: { custom_id: "leave", label: "Leave", style: ButtonStyle.Danger, type: ComponentType.Button },
  joinLeave: { custom_id: "joinLeave", label: "Join/Leave", style: ButtonStyle.Primary, type: ComponentType.Button },
  ready: { custom_id: "ready", label: "Ready/Idle", style: ButtonStyle.Primary, type: ComponentType.Button },
  myPlace: { custom_id: "myPlace", label: "My place", style: ButtonStyle.Primary, type: ComponentType.Button },
  actOk: { custom_id: "actOk", label: "Ok", style: ButtonStyle.Primary, type: ComponentType.Button },
  actBuyNo: { custom_id: "actBuyNo", label: "No", style: ButtonStyle.Danger, type: ComponentType.Button },
  actBuy: { custom_id: "actBuy", label: "Buy", style: ButtonStyle.Primary, type: ComponentType.Button },
  actCasinoNo: { custom_id: "actCasinoNo", label: "No", style: ButtonStyle.Danger, type: ComponentType.Button },
  actCasinoOk: { custom_id: "actCasinoOk", label: "Play", style: ButtonStyle.Primary, type: ComponentType.Button },
  actSell: { custom_id: "actSell", label: "Sell", style: ButtonStyle.Primary, type: ComponentType.Button },
};