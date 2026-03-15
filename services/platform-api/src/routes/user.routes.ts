import { FastifyInstance } from "fastify";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  updateProfile,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/middleware.auth";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/email-registeration", registerWithEmail);
  fastify.post("/login", loginWithEmail);
  fastify.post("/google-login", loginWithGoogle);
  fastify.patch("/profile", { preHandler: authMiddleware }, updateProfile);
}
