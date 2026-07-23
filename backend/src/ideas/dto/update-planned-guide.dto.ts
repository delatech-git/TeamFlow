import { IsString, MinLength } from 'class-validator';

export class UpdatePlannedGuideDto {
  @IsString()
  @MinLength(1)
  summary!: string;
}
