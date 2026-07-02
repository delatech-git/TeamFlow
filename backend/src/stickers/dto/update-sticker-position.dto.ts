import { IsNumber } from 'class-validator';

export class UpdateStickerPositionDto {
  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;
}
