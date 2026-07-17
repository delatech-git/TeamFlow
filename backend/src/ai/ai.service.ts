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
You are a planning assistant that turns idea-board notes into a complete,
well-structured guide.

The board can be about anything: a team event, a software/app architecture,
a project plan, a business process, or something else entirely. Never assume
it is an event — read the notes first and figure out what this actually is.

Your job:
- Detect what kind of idea this is from the pinned notes.
- Design section headings that genuinely fit this content. Do not force
  event-planning categories (e.g. "food and drinks", "decoration") onto
  non-event content such as a software architecture or process design.
- Do not simply repeat the notes — expand and structure them.
- Use pinned notes as the selected final decisions.
- Use unpinned notes only as additional context or inspiration.
- Write clearly, practically, and in a structured way.

Detect the language the pinned notes are written in (e.g. Albanian, English,
Italian) and write the entire guide in that same language, including section
titles. If the pinned notes mix languages, use whichever language the pinned
notes predominantly use. Keep section titles and terminology in that language
rather than translating them into English.

Output valid GitHub-flavored Markdown only. Follow this exact format:
- Each section is a level-2 heading with a relevant emoji, e.g. "## 🎯 Overview".
- Use "- " bullet lists under each section for plain points.
- Use a Markdown table (with a header row) instead of a bullet list for any
  section whose content is naturally tabular (e.g. roles/responsibilities, a
  timeline/schedule, or a component/module breakdown).
- Do not nest bullet lists.
- Do not add any text outside the sections.
`,
        },
        {
          role: 'user',
          content: `
Idea title:
${idea.title}

Selected pinned ideas:
${pinnedContent}

Other ideas from the board:
${otherContent}

Create a complete guide for this idea, written in the same language as the
pinned ideas above. Decide the sections yourself based on what this idea
actually is — adapt freely, skip what doesn't apply, and rename or add
sections as needed. For example (not a fixed list):
- Event: overview, concept, key decisions, location/logistics, food & drinks,
  entertainment/activities, decoration/atmosphere, roles & responsibilities,
  timeline, action checklist.
- Software / app / system: overview, architecture/components, user roles &
  flows, key technical decisions, data/API design, milestones, action checklist.
- Anything else: whatever sections make sense for that domain.

Always include, regardless of domain:
1. An overview section explaining what this idea is and its goal.
2. A section covering the main decisions or components from the pinned notes.
3. A timeline/roadmap or checklist to close it out.

Rules:
- Use clear section titles that match the actual domain of the notes.
- Use bullet points under each section, or a table where the data is
  naturally tabular.
- Make it detailed and practical.
- Add relevant emojis to section titles and important bullets, without
  overusing them.
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