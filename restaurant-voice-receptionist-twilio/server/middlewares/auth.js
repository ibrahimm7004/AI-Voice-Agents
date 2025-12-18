import { admin } from "../firebase.js";

export const authMiddleware = async (request, reply) => {
  const token = request.headers.authorization;

  if (!token) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken) {
      throw new Error("Invalid token");
    }
    const userId = decodedToken.user_id;
    if (!userId) {
      throw new Error("Invalid token");
    }

    // console.log(userId);
  } catch (__) {
    // console.error("Token verification failed:", error);
    reply.code(401).send({ error: "Unauthorized" });
  }
};
