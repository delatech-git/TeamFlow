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
}
