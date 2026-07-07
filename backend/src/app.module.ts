import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IdeasModule } from './ideas/ideas.module';
import { TagsModule } from './tags/tags.module';
import { BoardsModule } from './boards/boards.module';
import { StickersModule } from './stickers/stickers.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { AiModule } from './ai/ai.module';
import { RolesModule } from './roles/roles.module';

import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    IdeasModule,
    TagsModule,
    BoardsModule,
    StickersModule,
    CommentsModule,
    ReactionsModule,
    AiModule,
    RolesModule,
    CommonModule,
    ConfigModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
