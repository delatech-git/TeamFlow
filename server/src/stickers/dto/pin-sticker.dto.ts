import { IsBoolean } from 'class-validator';

export class PinStickerDto {
  @IsBoolean()
  isPinned!: boolean;
}
