import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdea(ideaId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { ideaId },
      include: {
        user: {
          select: { id: true, username: true, fullName: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.value, 0) /
          ratings.length
        : 0;

    return {
      average,
      count: ratings.length,
      ratings,
    };
  }

  async rate(ideaId: string, userId: string, value: number) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      select: { id: true },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    return this.prisma.rating.upsert({
      where: { ideaId_userId: { ideaId, userId } },
      update: { value },
      create: { ideaId, userId, value },
      include: {
        user: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });
  }
}
