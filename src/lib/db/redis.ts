import { REDIS_URL } from '$lib/utils/server/constants';
import Redis, { type RedisOptions } from 'ioredis';

let redisInstance: Redis | null = null;
const defaultRedisOptions: RedisOptions = {
	keyPrefix: 'fortihub:'
};

export function createRedisConnection(redisUrl: string): Redis {
	const url = new URL(redisUrl);

	// Parse query parameters
	const params = Object.fromEntries(url.searchParams.entries());
	const tlsEnabled = params.tls === 'true' || params.tls === '1';
	const sni = params.sni || undefined;

	// Prepare ioredis options
	const options: RedisOptions = {
		port: Number(url.port) || 6379,
		host: url.hostname,
		username: url.username || undefined,
		password: url.password || undefined,
		...defaultRedisOptions
	};

	if (tlsEnabled) {
		options.tls = {
			servername: sni || url.hostname
		};
	}

	return new Redis(options);
}

function redis() {
	if (!redisInstance) {
		if (!REDIS_URL) {
			console.error('REDIS_URL is required');
			return new Redis(defaultRedisOptions);
		}

		redisInstance = createRedisConnection(REDIS_URL);
	}

	return redisInstance;
}

export default redis;
