import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import OpenAI from 'openai';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateIdeaSummary(ideaId: string) {
    this.logger.log(`[AI SUMMARY] Called with ideaId: ${ideaId}`);

    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        plannedGuide: true,
        board: {
          include: {
            stickers: true,
          },
        },
      },
    });

    if (!idea || !idea.board) {
      throw new NotFoundException('Idea board not found');
    }

    this.logger.log(
      `[AI SUMMARY] Idea found: ${idea.title} | status: ${idea.status}`,
    );

    this.logger.log(
      `[AI SUMMARY] Board stickers count: ${idea.board.stickers.length}`,
    );

    const allStickers = idea.board.stickers.filter(
      (sticker) => sticker.content && sticker.content.trim().length > 0,
    );

    const pinnedStickers = allStickers.filter((sticker) => sticker.isPinned);
    const otherStickers = allStickers.filter((sticker) => !sticker.isPinned);

    this.logger.log(
      `[AI SUMMARY] All stickers with content: ${allStickers.length}`,
    );
    this.logger.log(`[AI SUMMARY] Pinned stickers: ${pinnedStickers.length}`);
    this.logger.log(`[AI SUMMARY] Other stickers: ${otherStickers.length}`);

    this.logger.debug(
      `[AI SUMMARY] Pinned stickers data:\n${JSON.stringify(
        pinnedStickers.map((sticker) => ({
          id: sticker.id,
          content: sticker.content,
          isPinned: sticker.isPinned,
        })),
        null,
        2,
      )}`,
    );

    if (pinnedStickers.length === 0) {
      throw new BadRequestException(
        'Please pin at least one idea before generating the planned guide.',
      );
    }

    const pinnedContent = pinnedStickers
      .map(
        (sticker, index) =>
          `${index + 1}. ${extractStickerText(sticker.content)}`,
      )
      .join('\n');

    const otherContent = otherStickers.length
      ? otherStickers
          .map(
            (sticker, index) =>
              `${index + 1}. ${extractStickerText(sticker.content)}`,
          )
          .join('\n')
      : 'No additional unpinned ideas were provided.';

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: `
You are an event planning assistant.

Your job is to transform idea-board notes into a complete planned event guide.
Do not simply repeat the notes.
Use pinned notes as the selected final decisions.
Use unpinned notes only as additional context or inspiration.
Write clearly, practically, and in a structured way.

Output valid GitHub-flavored Markdown only. Follow this exact format:
- Each of the 10 sections is a level-2 heading, e.g. "## 🎯 Event overview".
- Use "- " bullet lists under each section for plain points.
- For "Roles and responsibilities" and "Timeline before the event", use a
  Markdown table (with a header row) instead of a bullet list.
- Do not nest bullet lists.
- Do not add any text outside the 10 sections.
`,
        },
        {
          role: 'user',
          content: `
Event idea title:
${idea.title}

Selected pinned ideas:
${pinnedContent}

Other ideas from the board:
${otherContent}

Create a complete planned-event guide.

The output must include:

1. 🎯 Event overview
2. ✨ Final concept
3. 📌 Main planned decisions
4. 📍 Location / setup plan
5. 🍽️ Food and drinks plan
6. 🎵 Entertainment / activities
7. 🎨 Decoration / atmosphere
8. 👥 Roles and responsibilities
9. 🗓️ Timeline before the event
10. ✅ Action points checklist

Rules:
- Use clear section titles.
- Use bullet points under each section.
- Make it detailed, practical, and entertaining.
- Add relevant emojis to section titles and important bullets.
- Do not overuse emojis; keep it professional but fun.
- Do not write only the selected notes.
- Do not start with "Summary for".
- Do not mention sticky notes, stickers, or pinned notes in the final answer.
`,
        },
      ],
    });

    const summary = completion.choices[0].message.content?.trim() ?? '';

    this.logger.log(`[AI SUMMARY] OpenAI summary length: ${summary.length}`);
    this.logger.debug(
      `[AI SUMMARY] OpenAI summary preview:\n${summary.slice(0, 1500)}`,
    );

    if (!summary) {
      throw new BadRequestException('AI could not generate a planned guide.');
    }

    const savedSummary = await this.prisma.planSummary.upsert({
      where: {
        ideaId: idea.id,
      },
      update: {
        summary,
        createdById: idea.createdById,
      },
      create: {
        ideaId: idea.id,
        summary,
        createdById: idea.createdById,
      },
    });

    const updatedIdea = await this.prisma.idea.update({
      where: {
        id: idea.id,
      },
      data: {
        status: 'PLANNED',
      },
    });

    this.logger.log(
      `[AI SUMMARY] Idea updated: ${updatedIdea.id} | status: ${updatedIdea.status}`,
    );

    this.logger.log(
      `[AI SUMMARY] Saved planned guide length: ${savedSummary.summary.length}`,
    );

    this.logger.debug(
      `[AI SUMMARY] Saved planned guide preview:\n${savedSummary.summary.slice(
        0,
        1500,
      )}`,
    );

    this.logger.log(
      `[AI SUMMARY] PlanSummary saved: ${savedSummary.id} | ideaId: ${savedSummary.ideaId}`,
    );

    return savedSummary;
  }
}

function extractStickerText(content: string): string {
  try {
    const parsed = JSON.parse(content);

    if (parsed?.kind === 'note' && parsed?.note?.text) {
      return String(parsed.note.text).trim();
    }

    if (parsed?.kind === 'fun' && parsed?.item?.text) {
      return String(parsed.item.text).trim();
    }

    if (parsed?.item?.value) {
      return String(parsed.item.value).trim();
    }

    return content.trim();
  } catch {
    return content.trim();
  }
}