import { createFileRoute } from "@tanstack/react-router";
import { runDispatcher } from "@/lib/kira/dispatch.server";

export const Route = createFileRoute("/api/cron/dispatch")({
  server: {
    handlers: {
      GET: async () => {
        const result = await runDispatcher();
        return Response.json(result);
      },
      POST: async () => {
        const result = await runDispatcher();
        return Response.json(result);
      },
    },
  },
});
