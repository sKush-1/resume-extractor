import { FastifyInstance } from "fastify";
import {
  getUserDetails,
  refreshAccessToken,
  sendEmailVerificationRequest,
  verifyUserEmailOTP,
} from "../controllers/auth.controller";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/send-email-verification-request",
    sendEmailVerificationRequest,
  );
  fastify.post("/verify-email-otp", verifyUserEmailOTP);
  fastify.get("/get-refresh-token", refreshAccessToken);
  fastify.get("/me", getUserDetails);
}
