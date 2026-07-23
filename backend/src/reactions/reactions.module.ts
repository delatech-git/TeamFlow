import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import {
  CommentReactionsController,
  ReactionsController,
} from './reactions.controller';

@Module({
  controllers: [ReactionsController, CommentReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
