import { Hono } from "hono";
import { serve } from "@hono/node-server";
import webhook from "./webhook";
import "dotenv/config";

const app = new Hono();

app.route("/github", webhook);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port });
console.log(`GitHub bot listening on port ${port}`);
