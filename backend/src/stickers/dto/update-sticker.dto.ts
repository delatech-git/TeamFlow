import { IsOptional, IsString } from 'class-validator';

export class UpdateStickerDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
