import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { SaveIdeaBoardDto } from './dto/save-idea-board.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
@Injectable()
export class IdeasService {
  constructor(
   private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
) {}

  async create(
    dto: CreateIdeaDto,
    userId: string,
    coverImage?: Express.Multer.File,
  ) {
    const uploadedCover = coverImage
      ? await this.cloudinaryService.uploadIdeaCover(coverImage)
      : null;

    try {
      return await this.prisma.idea.create({
        data: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          coverImageUrl: uploadedCover?.secure_url ?? null,
          status: 'NEW',
          createdById: userId,
          tags: {
            connect: dto.tagIds.map((id) => ({ id })),
          },
          board: {
            create: {},
          },
        },
        include: {
          createdBy: true,
          tags: true,
          board: true,
        },
      });
    } catch (error) {
      if (uploadedCover?.public_id) {
        await this.cloudinaryService.deleteImage(uploadedCover.public_id);
      }

      throw error;
    }
  }

  async findOne(id: string) {
    return this.prisma.idea.findUnique({
      where: { id },

      include: {
        createdBy: true,
        tags: true,

        board: {
          include: {
            stickers: {
              include: {
                author: true,
                reactions: true,
              },
            },
          },
        },

        comments: {
          include: {
            author: true,
          },
        },

        photos: {
          include: { uploadedBy: true },
          orderBy: { createdAt: 'desc' },
        },

        summary: true,
      },
    });
  }

  async findAll(status?: string) {
    return this.prisma.idea.findMany({
      where: status
        ? {
            status: status as any,
          }
        : undefined,

      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },

        tags: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async saveBoard(id: string, dto: SaveIdeaBoardDto, userId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    const board = await this.prisma.board.upsert({
      where: { ideaId: id },
      update: {},
      create: { ideaId: id },
      select: { id: true },
    });

    const notes = Array.isArray(dto.notes) ? dto.notes : [];
    const funItems = Array.isArray(dto.funItems) ? dto.funItems : [];
    const pinnedNoteIds = Array.isArray(dto.pinnedNoteIds)
      ? dto.pinnedNoteIds
      : [];

    const stickers = [
      ...notes.map((note) => ({
        type: 'NOTE' as const,
        content: JSON.stringify({ kind: 'note', note }),
        x: getNumber(note, 'x'),
        y: getNumber(note, 'y'),
        width: getNullableNumber(note, 'width'),
        height: getNullableNumber(note, 'height'),
        color: getNullableString(note, 'color'),
        isPinned: pinnedNoteIds.includes(getString(note, 'id')),
        boardId: board.id,
        authorId: userId,
      })),
      ...funItems.map((item) => ({
        type: mapFunItemType(item),
        content: JSON.stringify({ kind: 'fun', item }),
        x: getNumber(item, 'x'),
        y: getNumber(item, 'y'),
        width: getNullableNumber(item, 'width'),
        height: getNullableNumber(item, 'height'),
        color: null,
        isPinned: false,
        boardId: board.id,
        authorId: userId,
      })),
      {
        type: 'TEXT' as const,
        content: JSON.stringify({
          kind: 'meta',
          pinnedNoteIds,
          summaryPreview: dto.summaryPreview ?? '',
          postedDecisionId: dto.postedDecisionId ?? null,
        }),
        x: 0,
        y: 0,
        width: null,
        height: null,
        color: null,
        isPinned: false,
        boardId: board.id,
        authorId: userId,
      },
    ];

    await this.prisma.$transaction(async (tx) => {
      await tx.sticker.deleteMany({ where: { boardId: board.id } });
      if (stickers.length > 0) {
        await tx.sticker.createMany({ data: stickers });
      }
    });

    return { success: true };
  }

  async addPhoto(ideaId: string, file: Express.Multer.File, userId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      select: { id: true },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    const uploaded = await this.cloudinaryService.uploadIdeaMoment(file);

    return this.prisma.ideaPhoto.create({
      data: {
        ideaId,
        uploadedById: userId,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      },
      include: {
        uploadedBy: true,
      },
    });
  }

  async findPhotos(ideaId: string) {
    return this.prisma.ideaPhoto.findMany({
      where: { ideaId },
      include: { uploadedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removePhoto(ideaId: string, photoId: string) {
    const photo = await this.prisma.ideaPhoto.findFirst({
      where: { id: photoId, ideaId },
    });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.ideaPhoto.delete({ where: { id: photoId } });
    await this.cloudinaryService.deleteImage(photo.publicId);
  }

  async remove(id: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    await this.prisma.idea.delete({ where: { id } });
  }
}

function mapFunItemType(item: unknown): 'EMOJI' | 'TEXT' | 'IMAGE' {
  const kind = getString(item, 'kind');
  if (kind === 'emoji') return 'EMOJI';
  if (kind === 'text') return 'TEXT';
  return 'IMAGE';
}

function getNumber(value: unknown, key: string): number {
  if (!value || typeof value !== 'object') return 0;
  const next = (value as Record<string, unknown>)[key];
  return typeof next === 'number' ? next : 0;
}

function getNullableNumber(value: unknown, key: string): number | null {
  if (!value || typeof value !== 'object') return null;
  const next = (value as Record<string, unknown>)[key];
  return typeof next === 'number' ? next : null;
}

function getString(value: unknown, key: string): string {
  if (!value || typeof value !== 'object') return '';
  const next = (value as Record<string, unknown>)[key];
  return typeof next === 'string' ? next : '';
}

function getNullableString(value: unknown, key: string): string | null {
  const next = getString(value, key);
  return next || null;
}
