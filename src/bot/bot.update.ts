import { Context, Telegraf } from "telegraf";
import { BotService } from "./bot.service";
import {On, Start, Update } from "nestjs-telegraf";

@Update()
export class BotUpdate {
	constructor(private readonly botService: BotService) {}

	@Start()
	async start(ctx: Context) {
		await this.botService.saveUpdate(ctx);

		await ctx.reply("Hello");
	}

	

	@On("edited_message")
	@On("callback_query")
	@On("inline_query")
	@On("my_chat_member")
	@On("chat_member")
	@On("message")
	async onAny(ctx: Context) {
		await this.botService.saveUpdate(ctx);
	}
}
