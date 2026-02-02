import { Injectable } from "@nestjs/common";

import { Context } from "telegraf";
import { BotRepository } from "./bot.repository";
import { PrismaJson, UpsertTgChat, UpsertTgUser } from "./bot.types";

@Injectable()
export class BotService {
	constructor(private readonly botRepository: BotRepository) {}

	async saveUpdate(ctx: Context) {
		let userId: number | null = null;
		let chatId: number | null = null;
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
		if (ctx.chat) {
			const chat = ctx.chat;
			const chatData: UpsertTgChat = {
				telegramId: BigInt(chat.id),
				type: chat.type,
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
			raw: ctx.update as unknown as PrismaJson,
			messageText: ctx.text || null,
			userId: userId,
			chatId: chatId,
		};

		await this.botRepository.createEvent(eventData);
	}

	async getMeSummary() {}
}
