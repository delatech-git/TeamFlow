import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { IdeasService } from './ideas.service';
import { CreateIdeaMultipartDto } from './dto/createIdeaMultipartDto';
import { SaveIdeaBoardDto } from './dto/save-idea-board.dto';
import { UpdatePlannedGuideDto } from './dto/update-planned-guide.dto';
import { UpdateIdeaStatusDto } from './dto/update-idea-status.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth-guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ideasService.findAll(status, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ideasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('coverImage', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() dto: CreateIdeaMultipartDto,
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|avif|gif)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    coverImage?: Express.Multer.File,
  ) {
    return this.ideasService.create(
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        tagIds: parseTagIds(dto.tagIds),
        status: dto.status,
      },
      user.id,
      coverImage,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateIdeaStatusDto) {
    return this.ideasService.updateStatus(id, dto.status);
  }

  @Post(':id/team-photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  addTeamPhoto(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|avif|gif)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    photo: Express.Multer.File,
  ) {
    return this.ideasService.addTeamPhoto(id, user.id, photo);
  }

  @Patch(':id/cover-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('coverImage', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  updateCoverImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|avif|gif)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    coverImage: Express.Multer.File,
  ) {
    return this.ideasService.updateCoverImage(id, coverImage);
  }

  @Put(':id/board')
  @UseGuards(JwtAuthGuard)
  saveBoard(
    @Param('id') id: string,
    @Body() dto: SaveIdeaBoardDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ideasService.saveBoard(id, dto, user.id);
  }

  @Put(':id/planned-guide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updatePlannedGuide(
    @Param('id') id: string,
    @Body() dto: UpdatePlannedGuideDto,
  ) {
    return this.ideasService.updatePlannedGuide(id, dto.summary);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.ideasService.remove(id);
  }
}

function parseTagIds(value: string | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new BadRequestException('tagIds must be an array');
    }

    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    throw new BadRequestException('Invalid tagIds format');
  }
}