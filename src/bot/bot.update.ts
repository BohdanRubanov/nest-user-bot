import { Context } from "telegraf";
import { BotService } from "./bot.service";
import { Command, On, Start, Update } from "nestjs-telegraf";

@Update()
export class BotUpdate {
	constructor(private readonly botService: BotService) {}

	@Start()
	async start(ctx: Context) {
		await this.botService.saveUpdate(ctx);

		await ctx.reply("Hello");
	}

	@Command("me")
	async me(ctx: Context) {
		await this.botService.saveUpdate(ctx);
		const text = await this.botService.getMeSummary(ctx);
		await ctx.replyWithHTML(text);
	}

	// Catch-all handler for all types of updates
	@On("edited_message")
	@On("callback_query")
	@On("inline_query")
	@On("my_chat_member")
	@On("chat_member")
	@On("message")
	async onAnyEvent(ctx: Context) {
		await this.botService.saveUpdate(ctx);
		await ctx.reply("Update saved.");
	}
}
