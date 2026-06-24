import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum StickerType {
  TEXT = 'TEXT',
  NOTE = 'NOTE',
  IMAGE = 'IMAGE',
  EMOJI = 'EMOJI',
}

export class CreateStickerDto {
  @IsEnum(StickerType)
  type!: StickerType;

  @IsString()
  content!: string;

  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
