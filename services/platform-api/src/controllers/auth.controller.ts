import { FastifyRequest, FastifyReply } from "fastify";
import { sendResponse } from "../utils/sendresponse.util";
import { validateEmailVerification } from "../utils/validation/auth.validation";
import { generateTokenCode } from "../utils/generateOtp.util";
import { sendVerificationEmail } from "../services/sendEmail.service";
import { user_access_token_payload } from "../interfaces/users";
import {
  createUserAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import { getUserByEmail, getUserByID } from "../services/user.service";
import logger from "../utils/logger";

interface authData {
  email: string;
  otp: string;
}

export const sendEmailVerificationRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { email } = request.body as authData;
  const { redis } = request.server;

  try {
    const validationResult = validateEmailVerification(request.body);
    if (validationResult.error)
      return sendResponse(reply, 400, true, "email validation failed");

    const alreadyUserExist = await getUserByEmail(email);

    if (alreadyUserExist) {
      return sendResponse(reply, 200, true, "User is already registered.");
    }

    const alreadyVerified = await redis.get(`user:verified:${email}`);
    if (alreadyVerified === "true") {
      return sendResponse(reply, 200, true, "Email is already verified.");
    }

    const otp = generateTokenCode();

    const key = `verify:${email}`;

    // set OTP (24 hour expiry)
    await redis.set(key, JSON.stringify({ email, otp }), "EX", 86400);

    console.log(`[AUTH] Verification OTP for ${email}: ${otp}`);

    try {
      sendVerificationEmail(email, otp);
    } catch (err) {
      await redis.del(key); // cleanup OTP if email sending fails
      throw err;
    }

    const result = {
      message: "we have sent token to users email inbox/spam check it",
      email,
    };

    return sendResponse(
      reply,
      200,
      false,
      "Sent email verification request.",
      result,
    );
  } catch (error) {
    logger.error("Error in email verification:", error);
    return sendResponse(reply, 500, false, "Failed to send email verification");
  }
};

export const verifyUserEmailOTP = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { email, otp } = request.body as authData;
  const { redis } = request.server;
  try {
    const validationResult = validateEmailVerification(request.body);
    if (validationResult.error)
      return sendResponse(reply, 400, true, validationResult.error);

    const alreadyVerified = await redis.get(`user:verified:${email}`);

    if (alreadyVerified) {
      return sendResponse(reply, 400, true, "Email is already verified.");
    }

    const otpKey = `verify:${email}`;

    const otpData = await redis.get(otpKey);

    if (!otpData) {
      return sendResponse(
        reply,
        401,
        true,
        "otp data not found or expired. Please request a new verification email.",
      );
    }

    const parsedData: authData = JSON.parse(otpData);
    const redisToken: string = parsedData.otp;

    if (otp !== redisToken) {
      return sendResponse(reply, 401, true, "Invalid OTP.");
    }

    const key = `user:verified:${email}`;

    // Set a verification flag in Redis for 5 minutes
    await redis.set(key, "true", "EX", 300);

    const result = {
      email,
    };

    return sendResponse(
      reply,
      200,
      false,
      "we have verified user onboard for registeration now.",
      result,
    );
  } catch (error) {
    logger.error("Error in generateSuggestions:", error);
    return sendResponse(reply, 500, true, "Failed to generate suggestions");
  }
};

export const refreshAccessToken = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const refreshToken = request.cookies.refreshToken as string;

  if (!refreshToken) {
    return sendResponse(reply, 401, false, "Refresh token missing.");
  }

  try {
    // 1. Verify the Refresh Token
    // verifyRefreshToken should check the secret and return the decoded payload
    const decoded = verifyRefreshToken(
      refreshToken,
    ) as user_access_token_payload;

    const user = await getUserByID(decoded.user_id);

    if (!user) {
      return reply.status(404).send({ message: "User no longer exists." });
    }


    // 3. Generate a NEW Access Token (15m expiry)
    const newAccessToken = createUserAccessToken({
      user_id: user.id,
    });

    return reply
      .setCookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      })
      .setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .send({
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
      });
  } catch (error) {
    logger.error(error);
    return sendResponse(reply, 403, false, "Invalid or expired refresh token.");
  }
};

export const getUserDetails = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const accessToken = request.cookies.accessToken as string;

  if (!accessToken) {
    return sendResponse(reply, 401, false, "access token missing.");
  }

  try {
    const decoded = verifyAccessToken(accessToken) as user_access_token_payload;

    const getUserByid = await getUserByID(decoded.user_id);

    if (!getUserByid) {
      return reply.status(404).send({ message: "User no longer exists." });
    }

    const { password_hash, ...userWithoutPassword } = getUserByid;

    return reply.status(200).send({
      userDetails: userWithoutPassword,
    });
  } catch (error) {
    logger.error(error);
    return sendResponse(reply, 403, false, "Invalid or expired refresh token.");
  }
};
