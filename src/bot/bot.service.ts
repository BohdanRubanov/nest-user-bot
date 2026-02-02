import { Injectable } from "@nestjs/common";

import { Context } from "telegraf";
import { BotRepository } from "./bot.repository";
import { PrismaJson, UpsertTgChat, UpsertTgUser } from "./bot.types";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class BotService {
	//divide responsibilities: BotService for business logic, BotRepository for DB operations
	constructor(
		private readonly botRepository: BotRepository,
		private readonly redisService: RedisService,
	) {}

	async saveUpdate(ctx: Context) {
		let userId: number | null = null;
		let chatId: number | null = null;
		// ctx.from - information about the user who sent the message
		if (ctx.from) {
			const from = ctx.from;
			const userData: UpsertTgUser = {
				telegramId: BigInt(from.id),
				username: from.username || null,
				firstName: from.first_name || null,
				lastName: from.last_name || null,
				languageCode: from.language_code || null,
				isBot: from.is_bot || false,
			};
			userId = await this.botRepository.upsertUser(userData);
		}
		// ctx.chat - information about the chat where the message was sent
		if (ctx.chat) {
			const chat = ctx.chat;
			const chatData: UpsertTgChat = {
				telegramId: BigInt(chat.id),
				type: chat.type,
				// Optional fields
				// title and username may not be present in all chat types
				title: "title" in chat ? chat.title : null,
				username: "username" in chat ? chat.username : null,
			};

			chatId = await this.botRepository.upsertChat(chatData);
		}

		const eventData = {
			updateId: BigInt(ctx.update.update_id),
			eventType: ctx.updateType,
			messageId: ctx.msgId ? BigInt(ctx.msgId) : null,
			dateUnix: ctx.message?.date || null,
			// type assertion to PrismaJson to satisfy the type requirement
			raw: ctx.update as unknown as PrismaJson,
			messageText: ctx.text || null,
			userId: userId,
			chatId: chatId,
		};

		await this.botRepository.createEvent(eventData);
	}

	async getMeSummary(ctx: Context): Promise<string> {
		if (!ctx.from) {
			return "No user information available.";
		}
		// key is unique per user
		const rateKey = `rate-limit:me:${ctx.from.id}`;
		// allow 1 request per 2 seconds
		const limited = await this.redisService.hitRateLimit(rateKey, 2, 1);
		if (limited) {
			return "Too many requests. Try again in a moment.";
		}

		const user = await this.botRepository.findUserByTelegramId(
			BigInt(ctx.from.id),
		);

		if (!user) {
			return "User not found in database.";
		}

		if (!ctx.chat) {
			return "No chat information available.";
		}
		const chat = await this.botRepository.findChatByTelegramId(
			BigInt(ctx.chat.id),
		);

		const totalEvents = await this.botRepository.countEventsByUser(user.id);

		// сalculate timestamp for 24 hours ago
		// current time minus 24 hours in milliseconds
		const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const events24h = await this.botRepository.countEventsByUserSince(
			user.id,
			since,
		);

		const lastEvent = await this.botRepository.getLastEventByUser(user.id);

		const text =
			"<b>User</b>\n" +
			`<i>Telegram ID:</i> <code>${user.telegramId}</code>\n` +
			`<i>Username:</i> ${user.username ?? "-"}\n` +
			`<i>Name:</i> ${user.firstName ?? "-"} ${user.lastName ?? ""}\n` +
			`<i>Language:</i> ${user.languageCode ?? "-"}\n` +
			`<i>Is bot:</i> ${user.isBot}\n` +
			`<i>First seen:</i> ${user.createdAt.toLocaleString("uk-UA")}\n\n` +
			"<b>Chat</b>\n" +
			`<i>Telegram ID:</i> <code>${chat?.telegramId ?? "-"}</code>\n` +
			`<i>Type:</i> ${chat?.type ?? "-"}\n` +
			`<i>Title:</i> ${chat?.title ?? "-"}\n` +
			`<i>Username:</i> ${chat?.username ?? "-"}\n\n` +
			"<b>Activity</b>\n" +
			`<i>Total events:</i> <b>${totalEvents}</b>\n` +
			`<i>Events (24h):</i> <b>${events24h}</b>\n` +
			`<i>Last event:</i> ${
				lastEvent?.createdAt
					? lastEvent.createdAt.toLocaleString("uk-UA")
					: "-"
			}\n`;
		return text;
	}
}
