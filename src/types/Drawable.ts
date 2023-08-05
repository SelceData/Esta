import { Canvas } from "canvas";
import { AttachmentBuilder } from "discord.js";

export abstract class Drawable {
  static attachmentName = "image.png";
  abstract getImage(): Promise<Canvas>
  async getAttachment() {
    return new AttachmentBuilder((await this.getImage()).toBuffer("image/png"), { name: Drawable.attachmentName });
  }
}