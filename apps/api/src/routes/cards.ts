import { Hono } from "hono";
import type { AppEnv } from "../env.js";
import { notImplemented } from "../middleware.js";

/** WS-H owns this file: satori + resvg share cards. `/card/:kind/:id/:variant.png?v=` */
const cards = new Hono<AppEnv>();
cards.get("/:kind/:id/:variant", notImplemented("share card"));
export default cards;
