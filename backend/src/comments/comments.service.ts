import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

  async update(
    ideaId: string,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    if (typeof dto.content !== 'string' || dto.content.trim().length === 0) {
      throw new BadRequestException('Content is required');
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.ideaId !== ideaId) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content.trim() },
      include: {
        author: true,
        reactions: { include: { user: true } },
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
