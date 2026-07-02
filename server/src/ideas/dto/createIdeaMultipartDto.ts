import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIdeaMultipartDto {
  @IsString()
  title!: string;

  @IsString()
  @MaxLength(1000)
  shortDescription!: string;

  @IsOptional()
  @IsString()
  tagIds?: string;
}