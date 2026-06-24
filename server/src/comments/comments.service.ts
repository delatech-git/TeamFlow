import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ideaId: string, dto: CreateCommentDto, userId: string) {
    return this.prisma.comment.create({
      data: {
        ideaId,
        authorId: userId,
        content: dto.content,
      },

      include: {
        author: true,
      },
    });
  }

  async findByIdea(ideaId: string) {
    return this.prisma.comment.findMany({
      where: { ideaId },

      include: {
        author: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
