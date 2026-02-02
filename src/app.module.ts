import { Module } from "@nestjs/common";

import { PrismaModule } from "./prisma/prisma.module";
import { BotModule } from "./bot/bot.module";
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';

@Module({
	imports: [PrismaModule, BotModule, RedisModule],
	providers: [RedisService],
})
export class AppModule {}
