import { APIEmbed, userMention, inlineCode, codeBlock, TimestampStyles, time, italic } from "discord.js";
import { Player, PlayerStatus } from "../types/user/Player.js";
import { Session, SessionClosedReason } from "../types/Session.js";
import { PlaceEstate } from "../types/place/PlaceEstate.js";
import { PlaceMoneyBonus } from "../types/place/PlaceMoneyBonus.js";
import { Drawable } from "../types/Drawable.js";
import { PlaceCasino } from "../types/place/PlaceCasino.js";

export const Embeds = {
  sessionInLobby(session: Session): APIEmbed {
    return {
      title: "Lobby.",
      fields: [
        { name: `Players (${session.allPlayers.length}):`, value: session.allPlayers.map(player => `${userMention(player.person.id)} ${inlineCode(player.status == PlayerStatus.Ready ? "Ready" : "Idle")}`).join("\n"), inline: true },
        { name: "Info:", value: Object.entries({ "Map": session.map.name, "Players limit": session.size }).map(([property, value]) => `${italic(property)}: ${value}`).join("\n"), inline: true }
      ]
    };
  },
  sessionInfo(session: Session): APIEmbed {
    return {
      title: "Game.",
      fields: [
        { name: `Players (${session.allPlayers.length}/${session.size}):`, value: session.allPlayers.map(player => `${inlineCode(player == session.player ? ">" : " ")} ${userMention(player.person.id)} ${session.map.currency.value(player.money)}`).join("\n"), inline: true },
        { name: "Info:", value: Object.entries({ "Map": session.map.name, "Players limit": session.size }).map(([property, value]) => `${italic(property)}: ${value}`).join("\n"), inline: true }
      ]
    };
  },
  gameRender: {
    image: {
      url: `attachment://${Drawable.attachmentName}`
    }
  },
  sessionClosed(session: Session, error?: Error): APIEmbed {
    const reason = session.closedReason;
    return {
      title: "The game is over.",
      description: `${!error ? reason ?? SessionClosedReason.Unknown : `${reason}\n${codeBlock(error.message)}`}\n${time(session.closedAt ?? new Date, TimestampStyles.RelativeTime)}`,
    };
  },
  playerActed(player: Player): APIEmbed {
    return {
      title: `You did ${player.lastStep} steps.`,
      description: player.lastActions.length == 0 ? "That's all." : player.lastActions.map(action => `* ${action.description}`).join("\n")
    };
  },
  playerBuyQuestion(player: Player): APIEmbed {
    return {
      title: `You did ${player.lastStep} steps.`,
      description: `${userMention(player.person.id)}, do you want buy current estate?`,
      fields: Embeds.playerPlaceInfo(player).fields,
    };
  },
  playerCasinoQuestion(player: Player): APIEmbed {
    if (player.place instanceof PlaceCasino) {
      const r: APIEmbed = {
        title: `You did ${player.lastStep} steps.`,
        description: `${userMention(player.person.id)}, do you want to try your luck? It's free!`,
      };
      if (player.session.moneyCasino > 0)
        r.fields = [{ name: "Winnings", value: player.currency.value(player.session.moneyCasino) }];
      return r;
    } else throw new Error(`Current place is not casino: ${player.place.name}`);
  },
  playerPlaceInfo(player: Player): APIEmbed {
    const title = "Current Place";
    if (player.place instanceof PlaceEstate) return {
      title,
      fields: [
        { name: "Name", value: player.place.name, inline: true },
        { name: "Group", value: player.place.groupName, inline: true },
        { name: "Price", value: player.currency.value(player.place.price), inline: true },
        { name: "Description", value: player.place.description },
      ]
    };
    else if (player.place instanceof PlaceMoneyBonus) return {
      title,
      fields: [
        { name: "Name", value: `${player.currency.value(player.place.value)}` },
        { name: "Description", value: player.place.description },
      ]
    };
    else return {
      title,
      fields: [
        { name: "Name", value: player.place.name },
        { name: "Description", value: player.place.description },
      ]
    };
  }
};