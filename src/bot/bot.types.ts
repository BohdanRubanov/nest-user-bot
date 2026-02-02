import { Prisma } from "generated/prisma/client";

export type TgUser = Prisma.TgUserGetPayload<{}>;
export type TgChat = Prisma.TgChatGetPayload<{}>;
export type TgEvent = Prisma.TgEventGetPayload<{}>;

export type UpsertTgUser = Partial<Omit<TgUser, "id" | "telegramId">> & {
	telegramId: bigint;
};
export type UpsertTgChat = Partial<Omit<TgChat, "id" | "telegramId">> & {
    telegramId: bigint;
};

export type CreateTgEvent = Prisma.TgEventUncheckedCreateInput;

export type PrismaJson =Prisma.InputJsonValue;