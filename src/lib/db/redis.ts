import { REDIS_URL } from "$lib/utils/server/constants";
import Redis, { type RedisOptions } from "ioredis"

let redisInstance: Redis | null = null;
const redisOptions: RedisOptions = {
	keyPrefix: "authms:",
}

function redis() {
	if (!redisInstance) {
		if (!REDIS_URL) {
			console.error("REDIS_URL is required");
			return new Redis()
		}

		redisInstance = new Redis(REDIS_URL, redisOptions);
	}

	return redisInstance;
}

export default redis;
