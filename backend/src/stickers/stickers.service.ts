import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateStickerDto } from './dto/create-sticker.dto';
import { UpdateStickerPositionDto } from './dto/update-sticker-position.dto';
import { UpdateStickerDto } from './dto/update-sticker.dto';
import { BoardsGateway } from '@/boards/boards.gateway';

@Injectable()
export class StickersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardsGateway: BoardsGateway,
  ) {}

  async create(boardId: string, dto: CreateStickerDto, userId: string) {
    const sticker = await this.prisma.sticker.create({
      data: {
        boardId,
        authorId: userId,
        type: dto.type,
        content: dto.content,
        x: dto.x,
        y: dto.y,
        width: dto.width,
        height: dto.height,
        color: dto.color,
        isPinned: dto.isPinned ?? false,
      },

      include: {
        author: true,
        reactions: true,
      },
    });

    this.boardsGateway.server.to(boardId).emit('sticker-created', sticker);

    return sticker;
  }

  async updatePosition(id: string, dto: UpdateStickerPositionDto) {
    const sticker = await this.prisma.sticker.update({
      where: { id },
      data: {
        x: dto.x,
        y: dto.y,
      },
      include: {
        author: true,
        reactions: true,
      },
    });

    this.boardsGateway.server
      .to(sticker.boardId)
      .emit('sticker-moved', sticker);

    return sticker;
  }

  async findByBoard(boardId: string) {
    return this.prisma.sticker.findMany({
      where: {
        boardId,
      },

      include: {
        author: true,
        reactions: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async pinSticker(id: string, isPinned: boolean) {
    return this.prisma.sticker.update({
      where: { id },

      data: {
        isPinned,
      },

      include: {
        author: true,
        reactions: true,
      },
    });
  }

  async updateSticker(id: string, dto: UpdateStickerDto) {
    return this.prisma.sticker.update({
      where: { id },

      data: {
        content: dto.content,
        color: dto.color,
      },

      include: {
        author: true,
        reactions: true,
      },
    });
  }

  async deleteSticker(id: string) {
    return this.prisma.sticker.delete({
      where: { id },
    });
  }
}
