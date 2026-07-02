import { IsString } from 'class-validator';

export class CreateReactionDto {
  @IsString()
  emoji!: string;
}
