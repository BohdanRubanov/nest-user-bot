import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
	CreateTgEvent,
	TgChat,
	TgEvent,
	TgUser,
	UpsertTgChat,
	UpsertTgUser,
} from "./bot.types";

@Injectable()
export class BotRepository {
	//divide responsibilities: BotService for business logic, BotRepository for DB operations
	constructor(private readonly prisma: PrismaService) {}

	async upsertUser(tgUser: UpsertTgUser): Promise<number> {
		// destructure telegramId and prepare update data without id
		// and create data with full tgUser
		const { telegramId, ...updateUser } = tgUser;
		const user = await this.prisma.tgUser.upsert({
			where: { telegramId },
			update: updateUser,
			create: tgUser,
		});
		return user.id;
	}
	async upsertChat(tgChat: UpsertTgChat): Promise<number> {
		// destructure telegramId and prepare update data without id
		// and create data with full tgChat
		const { telegramId, ...updateChat } = tgChat;
		const chatRow = await this.prisma.tgChat.upsert({
			where: { telegramId },
			update: updateChat,
			create: tgChat,
		});

		return chatRow.id;
	}

	async createEvent(tgEvent: CreateTgEvent): Promise<void> {
		await this.prisma.tgEvent.create({
			data: tgEvent,
		});
	}

	async findUserByTelegramId(telegramId: bigint): Promise<TgUser | null> {
		return this.prisma.tgUser.findUnique({
			where: { telegramId },
		});
	}

	async findChatByTelegramId(telegramId: bigint): Promise<TgChat | null> {
		return this.prisma.tgChat.findUnique({
			where: { telegramId },
		});
	}

	async countEventsByUser(userId: number): Promise<number> {
		return this.prisma.tgEvent.count({
			where: { userId },
		});
	}

	async countEventsByUserSince(userId: number, since: Date): Promise<number> {
		return this.prisma.tgEvent.count({
			where: {
				userId,
				// filter by createdAt greater than or equal to since date
				createdAt: { gte: since },
			},
		});
	}

	async getLastEventByUser(userId: number): Promise<TgEvent | null> {
		return this.prisma.tgEvent.findFirst({
			where: { userId },
			// order by createdAt descending to get the latest event
			orderBy: { createdAt: "desc" },
		});
	}

}
