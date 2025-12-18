import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import cors from "@fastify/cors";
import Fastify from "fastify";

import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import fs from "fs";

dotenv.config();

import { checkMapsData } from "./utils/updateMapsData.js";
import { admin } from "./firebase.js";

import questionsRoutes from "./routes/questions.js";
import analyticsRoutes from "./routes/analytics.js";
import migrationRoutes from "./routes/migration.js";
import callRoutes from "./routes/call.js";

const PORT = process.env.PORT || 8080;
const fastify = Fastify({ logger: false });
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);
fastify.register(cors, {
  origin: "*",
  credentials: true,
});

fastify.addHook("onRequest", async (request, __) => {
  console.log(
    `Route called @${new Date().toISOString()}: ${request.method} ${
      request.url
    }`
  );
});

// fastify.addHook("onResponse", async (request, reply) => {
//   console.log("fin");
//   const elapsedTime = Date.now() - request.raw.originalRequest.requestTime;
//   console.log(
//     `Route finished @${new Date().toISOString()}: ${request.method} ${
//       request.baseUrl
//     }${request.url} | Status: ${reply.statusCode} | Time: ${elapsedTime}ms`
//   );
// });

fastify.register(questionsRoutes, { prefix: "/questions" });
fastify.register(analyticsRoutes, { prefix: "/analytics" });
fastify.register(migrationRoutes, { prefix: "/migration" });
fastify.register(callRoutes);

checkMapsData();

const logFilePath = path.join("./", "server.log");
const deployed = process.env.K_SERVICE;
if (!deployed) {
  const originalConsoleLog = console.log;

  console.log = (...args) => {
    const logMessage = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      )
      .join(" ");

    originalConsoleLog(...args);

    fs.appendFileSync(
      logFilePath,
      `${new Date().toISOString()} - ${logMessage}\n`
    );
  };
}

fastify.get("/", async (request, reply) => {
  reply.send({ message: "Dine-Dialer" });
});

fastify.get("/get-test-token", async (request, reply) => {
  const { uid } = request.query;
  console.log(uid);

  try {
    const customToken = await admin.auth().createCustomToken(uid);

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`;

    const response = await axios.post(
      url,
      {
        token: customToken,
        returnSecureToken: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return reply.send({ token: response.data.idToken });
  } catch (error) {
    console.error("Error making request:", error.message);
    reply.code(500).send({ error: "Internal Server Error" });
  }
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (deployed) {
    console.log(`Server is deployed`);
  } else {
    console.log(`Server is listening on port ${PORT}`);
  }
});
