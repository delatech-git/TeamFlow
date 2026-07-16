import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RateIdeaDto } from './dto/rate-idea.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth-guard';

@Controller('ideas/:ideaId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get()
  findByIdea(@Param('ideaId') ideaId: string) {
    return this.ratingsService.findByIdea(ideaId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  rate(
    @Param('ideaId') ideaId: string,
    @Body() dto: RateIdeaDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ratingsService.rate(ideaId, user.id, dto.value);
  }
}
