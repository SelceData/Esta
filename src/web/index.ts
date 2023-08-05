import express from "express";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "../Bot.js";

const logger = new Logger("Web");
const app = express();
const port = parseInt(process.env.PORT ?? "3000");

app.set("view engine", "pug");
app.set("views", "./src/web/views");
app.use(express.static(path.resolve("./src/web/public")));

app.get("/", (req, res) => {
  res.render("index", { content: fs.readFileSync(fs.existsSync("./dist/web/report.html")  ? "./dist/web/report.html"  : "./dist/web/noreport.html").toString() });
});

export { app as WebApp, port as WebPort, logger as loggerWeb };