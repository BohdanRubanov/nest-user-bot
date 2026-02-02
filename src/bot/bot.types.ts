import { Prisma } from "generated/prisma/client";

export type TgUser = Prisma.TgUserGetPayload<{}>;
export type TgChat = Prisma.TgChatGetPayload<{}>;
export type TgEvent = Prisma.TgEventGetPayload<{}>;

// Upsert types exclude the "id" field since it's auto-generated
// and require "telegramId" for identification
export type UpsertTgUser = Partial<Omit<TgUser, "id" | "telegramId">> & {
	telegramId: bigint;
};
export type UpsertTgChat = Partial<Omit<TgChat, "id" | "telegramId">> & {
	telegramId: bigint;
};

export type CreateTgEvent = Prisma.TgEventCreateInput;

export type PrismaJson = Prisma.InputJsonValue;

