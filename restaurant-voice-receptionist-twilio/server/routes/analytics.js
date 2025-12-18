import { analyticsController } from "../controllers/analytics.js";
import { authMiddleware } from "../middlewares/auth.js";

async function analyticsRoutes(fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    await authMiddleware(request, reply);
  });

  fastify.get("/", analyticsController.getAnalytics);
}

export default analyticsRoutes;
