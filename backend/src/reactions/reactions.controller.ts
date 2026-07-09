import { Body, Controller, Param, Post } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';

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
