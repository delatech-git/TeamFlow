import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(stickerId: string, dto: CreateReactionDto, userId: string) {
    return this.prisma.reaction.create({
      data: {
        stickerId,
        userId: userId,
        emoji: dto.emoji,
      },
      include: {
        user: true,
      },
    });
  }

  async toggleForComment(commentId: string, userId: string, emoji: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing?.emoji === emoji) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
      return null;
    }

    return this.prisma.reaction.upsert({
      where: { commentId_userId: { commentId, userId } },
      update: { emoji },
      create: { commentId, userId, emoji },
      include: { user: true },
    });
  }
}
