import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { StickersService } from './stickers.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerPositionDto } from './dto/update-sticker-position.dto';
import { PinStickerDto } from './dto/pin-sticker.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';

@Controller('boards/:boardId/stickers')
export class StickersController {
  constructor(private readonly stickersService: StickersService) {}

  @Get()
  findByBoard(@Param('boardId') boardId: string) {
    return this.stickersService.findByBoard(boardId);
  }

  @Post()
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateStickerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.stickersService.create(boardId, dto, user.id);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdateStickerPositionDto,
  ) {
    return this.stickersService.updatePosition(id, dto);
  }

  @Patch(':id/pin')
  pinSticker(@Param('id') id: string, @Body() dto: PinStickerDto) {
    return this.stickersService.pinSticker(id, dto.isPinned);
  }

  @Patch(':id')
  updateSticker(@Param('id') id: string, @Body() dto: UpdateStickerDto) {
    return this.stickersService.updateSticker(id, dto);
  }

  @Delete(':id')
  deleteSticker(@Param('id') id: string) {
    return this.stickersService.deleteSticker(id);
  }
}
