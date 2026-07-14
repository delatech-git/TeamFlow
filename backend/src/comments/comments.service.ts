import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ideaId: string, dto: CreateCommentDto, userId: string) {
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.ideaId !== ideaId) {
        throw new BadRequestException('Parent comment not found on this idea');
      }
    }

    return this.prisma.comment.create({
      data: {
        ideaId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId,
      },

      include: {
        author: true,
        reactions: { include: { user: true } },
      },
    });
  }

  async findByIdea(ideaId: string) {
    return this.prisma.comment.findMany({
      where: { ideaId },

      include: {
        author: true,
        reactions: { include: { user: true } },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async remove(
    ideaId: string,
    commentId: string,
    userId: string,
    role: string,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.ideaId !== ideaId) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
  }
}
