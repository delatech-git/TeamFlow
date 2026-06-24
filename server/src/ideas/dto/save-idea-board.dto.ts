import { IsArray, IsOptional, IsString } from 'class-validator';

export class SaveIdeaBoardDto {
  @IsArray()
  notes!: unknown[];

  @IsArray()
  funItems!: unknown[];

  @IsArray()
  @IsString({ each: true })
  pinnedNoteIds!: string[];

  @IsOptional()
  @IsString()
  summaryPreview?: string | null;

  @IsOptional()
  @IsString()
  postedDecisionId?: string | null;
}
