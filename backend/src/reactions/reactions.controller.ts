import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth-guard';

@Controller('stickers/:stickerId/reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  create(
    @Param('stickerId') stickerId: string,
    @Body() dto: CreateReactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reactionsService.create(stickerId, dto, user.id);
  }
}

@Controller('comments/:commentId/reactions')
export class CommentReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param('commentId') commentId: string,
    @Body() dto: CreateReactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reactionsService.toggleForComment(
      commentId,
      user.id,
      dto.emoji,
    );
  }
}
