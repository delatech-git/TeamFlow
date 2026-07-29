import { IsArray } from 'class-validator';

export class CleanupBoardLayoutDto {
  @IsArray()
  connections!: unknown[];
}
