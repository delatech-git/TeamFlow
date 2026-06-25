import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { SaveIdeaBoardDto } from './dto/save-idea-board.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth-guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.ideasService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ideasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateIdeaDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ideasService.create(dto, user.id);
  }

  @Put(':id/board')
  @UseGuards(JwtAuthGuard)
  saveBoard(
    @Param('id') id: string,
    @Body() dto: SaveIdeaBoardDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ideasService.saveBoard(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.ideasService.remove(id);
  }
}
