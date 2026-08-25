import { serve } from "@hono/node-server";
import { app } from "./app.ts";

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`bones streaming demo → http://localhost:${info.port}`);
});
