import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AiService } from './ai.service';

import { GenerateSummaryDto } from './dto/generate-summary.dto';
import { GenerateLinkedInPostDto } from './dto/generate-linkedin-post.dto';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth-guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

import { Roles } from '@/common/decorators/roles.decorator';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  generateSummary(@Body() dto: GenerateSummaryDto) {
    return this.aiService.generateIdeaSummary(dto.ideaId);
  }

  @Post('linkedin-post')
  @UseGuards(JwtAuthGuard)
  generateLinkedInPost(@Body() dto: GenerateLinkedInPostDto) {
    return this.aiService.generateLinkedInCaption(dto.ideaId);
  }

  @Post('board-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  generateBoardImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(png|jpe?g)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 20 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
    @Body('texts') textsJson?: string,
  ) {
    let texts: string[] = [];
    try {
      const parsed = textsJson ? JSON.parse(textsJson) : [];
      if (Array.isArray(parsed)) {
        texts = parsed.filter((text): text is string => typeof text === 'string');
      }
    } catch {
      // Ignore malformed texts payload — the image alone still works.
    }
    return this.aiService.generateBoardImage(image, texts);
  }
}
