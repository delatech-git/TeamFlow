import { Body, Controller, Post, UseGuards } from '@nestjs/common';

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
}
