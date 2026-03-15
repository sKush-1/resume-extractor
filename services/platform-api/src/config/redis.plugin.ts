import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const redis = new Redis({
    host: process.env.redisHost,
    port: Number(process.env.redisPORT),
  });

  await new Promise((resolve, reject) => {
    redis.on("ready", () => {
      fastify.log.info("Redis connected and ready");
      resolve(true);
    });
    redis.on("error", (err) => {
      fastify.log.error("Redis connection error:");
      reject(err);
    });
  });

  fastify.decorate("redis", redis);

  fastify.addHook("onClose", async (instance) => {
    await instance.redis.quit();
  });
};

export default fp(redisPlugin);
