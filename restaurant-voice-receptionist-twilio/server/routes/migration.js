import { migrationController } from "../controllers/migration.js";

async function migrationRoutes(fastify) {
  fastify.get("/", migrationController.getCurrentValues);
}

export default migrationRoutes;
