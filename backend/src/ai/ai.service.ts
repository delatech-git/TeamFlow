import { Injectable } from '@nestjs/common';

import OpenAI from 'openai';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  async generateIdeaSummary(ideaId: string) {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },

      include: {
        board: {
          include: {
            stickers: true,
          },
        },
      },
    });

    if (!idea || !idea.board) {
      throw new Error('Idea board not found');
    }

    const pinnedStickers = idea.board.stickers.filter(
      (sticker) => sticker.isPinned,
    );

    const content = pinnedStickers
      .map((sticker) => `- ${sticker.content}`)
      .join('\n');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',

      messages: [
        {
          role: 'system',
          content: 'You summarize collaborative event planning decisions.',
        },

        {
          role: 'user',
          content: `
Idea: ${idea.title}

Pinned decisions:
${content}

Create:
1. Executive summary
2. Main decisions
3. Action points
`,
        },
      ],
    });

    const summary = completion.choices[0].message.content ?? '';

    const savedSummary = await this.prisma.planSummary.create({
      data: {
        ideaId: idea.id,
        summary,
        createdById: idea.createdById,
      },
    });

    await this.prisma.idea.update({
      where: {
        id: idea.id,
      },

      data: {
        status: 'PLANNED',
      },
    });

    return savedSummary;
  }
}
