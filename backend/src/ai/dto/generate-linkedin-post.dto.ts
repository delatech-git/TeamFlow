import { IsString } from 'class-validator';

export class GenerateLinkedInPostDto {
  @IsString()
  ideaId!: string;
}
