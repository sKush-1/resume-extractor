import { FastifyRequest, FastifyReply } from "fastify";
import { validateRegisterWithEmail } from "../utils/validation/user.validation";
import { sendResponse } from "../utils/sendresponse.util";
import {
  getUserByEmail,
  userEmailRegisterService,
  updateUserProfileService,
} from "../services/user.service";

import {
  user_access_token_payload,
  user_email_registeration,
  user_login_credentials,
} from "../interfaces/users";
import {
  createUserAccessToken,
  createUserRefreshToken,
} from "../utils/jwt.util";
import { compareUserPassword } from "../utils/bcrypt.util";

export const registerWithEmail = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { email, name, password } = request.body as user_email_registeration;
  const { redis } = request.server;
  const validationResult = validateRegisterWithEmail(request.body);

  if (validationResult.error) {
    return sendResponse(reply, 400, true, validationResult.error);
  }
  try {
    const userAlreadyExists = await getUserByEmail(email);

    if (userAlreadyExists) {
      return sendResponse(reply, 400, true, "user already exists.");
    }

    const isEmailVerified = await redis.get(`user:verified:${email}`);

    if (!isEmailVerified) {
      return sendResponse(reply, 401, true, "Email is not verified yet.");
    }

    const deviceId = request.headers['x-device-id'] as string;
    const fingerprint = request.headers['x-fingerprint'] as string;
    const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

    const registerUserID = await userEmailRegisterService(
      email,
      name,
      password,
      deviceId,
      ip,
      fingerprint,
    );

    const dbUser = await getUserByEmail(email);

    const accessTokenPayload: user_access_token_payload = {
      user_id: dbUser.id,
    };
    const accessToken = createUserAccessToken(accessTokenPayload);
    const refreshToken = createUserRefreshToken(accessTokenPayload);

    return reply
      .setCookie("accessToken", accessToken, {
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
      .status(201)
      .send({
        message: "User registered successfully",
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.log(error);
  }
};

export const loginWithEmail = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { email, password } = request.body as user_login_credentials;

  try {
    // 1. Verify User exists and fetch their hashed password
    const user = await getUserByEmail(email);
    if (!user) {
      return sendResponse(reply, 404, true, "User not found.");
    }

    // 2. Validate Password (using bcrypt or similar)
    const isPasswordMatch = await compareUserPassword(
      password,
      user.password_hash,
    );
    if (!isPasswordMatch) {
      return sendResponse(reply, 401, true, "Invalid credentials.");
    }

    // 3. Create Payloads
    const tokenPayload: user_access_token_payload = {
      user_id: user.id,
    };

    // 4. Generate Tokens
    // Note: Ensure createUserAccessToken sets "exp" to 15m
    const accessToken = createUserAccessToken(tokenPayload);
    const refreshToken = createUserRefreshToken(tokenPayload);

    return (
      reply
        // 1. Set Access Token Cookie
        .setCookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Only secure in production
          sameSite: "lax",
          path: "/",
          maxAge: 15 * 60 * 1000, // 15 minutes
        })
        // 2. Set Refresh Token Cookie (Chained)
        .setCookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        // 3. Send final status and JSON body
        .status(200)
        .send({
          message: "Login successful",
          accessToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email, // Note: email wasn't selected in service but is provided in req
          }
        })
    );
  } catch (error) {
    console.error(error);
    return sendResponse(reply, 500, true, "Internal Server Error");
  }
};

import { OAuth2Client } from 'google-auth-library';
import { upsertGoogleUser } from "../services/user.service";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { token } = request.body as { token: string };

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return sendResponse(reply, 401, true, "Invalid Google Token");
    }

    const { email, name, sub, picture } = payload;

    if (!email || !name) {
      return sendResponse(reply, 400, true, "Incomplete Google User Data");
    }

    const deviceId = request.headers['x-device-id'] as string;
    const fingerprint = request.headers['x-fingerprint'] as string;
    const ip = (request.headers['x-forwarded-for'] as string) || request.ip;

    const user = await upsertGoogleUser(email, name, sub, deviceId, ip, fingerprint);

    const accessTokenPayload: user_access_token_payload = {
      user_id: user.id,
    };

    const accessToken = createUserAccessToken(accessTokenPayload);
    const refreshToken = createUserRefreshToken(accessTokenPayload);

    return reply
      .setCookie("accessToken", accessToken, {
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
        message: "Login successful",
        accessToken,
        user
      });

  } catch (error) {
    console.error("Google Login Error:", error);
    return sendResponse(reply, 401, true, "Google Authentication Failed");
  }
};

export const updateProfile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // @ts-ignore - user_id is added by authMiddleware
  const userId = request.user_id;
  const { name } = request.body as { name: string };

  if (!name) {
    return sendResponse(reply, 400, true, "Name is required");
  }

  try {
    // We need to import this service function. I'll add the import in a separate step or assume I can modify imports here if I use replace_file_content on imports.
    // Wait, I can't easily modify imports and end of file in one go with replace_file_content unless I replace the whole file or do two edits.
    // I will write the function here, and then add the import at the top.

    // Actually, I can use `multi_replace_file_content` to do both.

    const updatedUser = await updateUserProfileService(userId, name);

    if (!updatedUser) {
      return sendResponse(reply, 404, true, "User not found");
    }

    return sendResponse(reply, 200, false, "Profile updated successfully", updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return sendResponse(reply, 500, true, "Internal Server Error");
  }
};

// export const updateProfilePic = async (
//   request: FastifyRequest,
//   reply: FastifyReply
// ) => {
//   // @ts-ignore - user_id is added by authMiddleware
//   const userId = request.user_id;

//   try {
//     const data = await request.file();

//     if (!data) {
//       return sendResponse(reply, 400, true, "No file uploaded");
//     }

//     // Validate mime type if needed (e.g. image/jpeg, image/png)
//     if (!data.mimetype.startsWith("image/")) {
//       return sendResponse(reply, 400, true, "Only image files are allowed");
//     }

//     const { url } = await uploadPublicFileToS3(data.file, data.filename, "profiles");

//     const updatedUser = await updateUserProfilePicService(userId, url);

//     if (!updatedUser) {
//       return sendResponse(reply, 404, true, "User not found");
//     }

//     return sendResponse(reply, 200, false, "Profile picture updated successfully", updatedUser);
//   } catch (error) {
//     console.error("Update Profile Pic Error:", error);
//     return sendResponse(reply, 500, true, "Internal Server Error");
//   }
// };


export const logoutUser = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  return reply
    .clearCookie("accessToken", { path: "/" })
    .clearCookie("refreshToken", { path: "/" })
    .status(200)
    .send({ message: "Logged out successfully" });
};
