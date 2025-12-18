import { questionsController } from "../controllers/questions.js";
import { authMiddleware } from "../middlewares/auth.js";

async function questionsRoutes(fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    await authMiddleware(request, reply);
  });

  fastify.get("/categories", questionsController.getQuestionCategories);
  fastify.post("/preview", questionsController.previewResponse);
  fastify.patch("/update/:id", questionsController.updateQuestion);
}

export default questionsRoutes;
