import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTgEvent, UpsertTgChat, UpsertTgUser } from "./bot.types";

@Injectable()
export class BotRepository {
	constructor(private readonly prisma: PrismaService) {}

	async upsertUser(tgUser: UpsertTgUser): Promise<number> {
		const { telegramId, ...updateUser } = tgUser;
		const user = await this.prisma.tgUser.upsert({
			where: {telegramId},
			update: updateUser,
			create: tgUser,
		});
		return user.id;
	}
	async upsertChat(tgChat: UpsertTgChat): Promise<number> {
		const { telegramId, ...updateChat } = tgChat;
		const chatRow = await this.prisma.tgChat.upsert({
			where: {telegramId},
			update: updateChat,
			create: tgChat,
		});

		return chatRow.id;
	}

	async createEvent(tgEvent: CreateTgEvent) {
		await this.prisma.tgEvent.create({
			data: tgEvent,
		});
	}
}
