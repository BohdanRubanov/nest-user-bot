import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { PrismaModule } from "../prisma/prisma.module";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { BotRepository } from "./bot.repository";

@Module({
	imports: [
		PrismaModule,
		//register TelegrafModule with bot token from environment variables
		TelegrafModule.forRoot({
			token: process.env.BOT_TOKEN || "",
		}),
	],
	providers: [BotRepository, BotService, BotUpdate],
})
export class BotModule {}
