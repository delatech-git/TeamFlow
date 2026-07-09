import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  title!: string;

  @IsString()
  @MaxLength(1000)
  shortDescription!: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsArray()
  tagIds!: string[];
}
