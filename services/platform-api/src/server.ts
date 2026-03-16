import Fastify, { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import { testConnection } from "./config/database/db.test";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import redisPlugin from "./config/redis.plugin";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import logger from "./utils/logger";
import { batchRoutes } from "./routes/batch.routes";

const server: FastifyInstance = Fastify({
  logger: true,
});

interface HelloResponse {
  hello: string;
}

server.get<{ Reply: HelloResponse }>(
  "/",

  async (_request, _reply) => {
    return { hello: "world" };
  },
);

const api_version = "/api/v1";

async function connectDB() {
  const isConnected = await testConnection();

  if (isConnected) {
    logger.info("Database connected successfully!");
    return;
  }

  logger.error("failed to connect db");
  process.exit(1);
}
connectDB();

const start = async () => {
  try {
    await server.register(cors, {
      origin: process.env.CORS || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    });

    await server.register(multipart, {
      limits: {
        fieldNameSize: 100,
        fieldSize: 10 * 1024 * 1024, // 10MB for field values
        fields: 50,
        fileSize: 500 * 1024 * 1024, // 500MB per batch/file
        files: 50,
      },
    });

    await server.register(redisPlugin);

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      await server.close();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      await server.close();
      process.exit(0);
    });

    await server.register(fastifyRateLimit, {
      max: 100, // Default global limit
      timeWindow: "1 minute",
      redis: server.redis, // Use the decorated redis instance
      errorResponseBuilder: (request, context) => {
        return {
          statusCode: 429,
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${context.after}.`
        }
      }
    });

    await server.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET, // optional: for signed cookies
    });

    await server.register(authRoutes, {
      prefix: `${api_version}/auth`,
    });

    await server.register(userRoutes, {
      prefix: `${api_version}/user`,
    });

    await server.register(batchRoutes, {
      prefix: `${api_version}/batches`,
    });

    // await server.register(creatorRoutes, {
    //   prefix: `${api_version}/creator`,
    // });

    // await server.register(blogRoutes, {
    //   prefix: `${api_version}/blogs`,
    // });

    // await server.register(postRoutes, {
    //   prefix: `${api_version}/posts`,
    // });

    // await server.register(mediaRoutes, {
    //   prefix: `${api_version}`,
    // });

    // await server.register(interactionRoutes, {
    //   prefix: `${api_version}`,
    // });

    // await server.register(reportRoutes, {
    //   prefix: `${api_version}/reports`,
    // });



    await server.listen({ port: 4000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
