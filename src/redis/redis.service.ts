import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, type RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client!: RedisClientType;
	// redis client initialization
	async onModuleInit() {
		this.client = createClient({
			url: process.env.REDIS_URL ?? "redis://localhost:6379",
		});

		this.client.on("error", (err) => {
			console.error("Redis Client Error", err);
		});

		await this.client.connect();
	}

	async onModuleDestroy() {
		if (this.client) {
			await this.client.quit();
		}
	}

	async hitRateLimit(
		key: string,
		seconds: number,
		maxRequests: number,
	): Promise<boolean> {
        // Increment the count for the given key
		const count = await this.client.incr(key);
        
        // If this is the first hit, set the expiration time for the key
		if (count === 1) {
            // Set the key to expire after the specified window seconds
			await this.client.expire(key, seconds);
		}
        // Return true if the count exceeds the maximum allowed requests
		return count > maxRequests;
	}
}
