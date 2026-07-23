import { IsIn } from 'class-validator';

export class UpdateIdeaStatusDto {
  @IsIn(['DRAFT', 'NEW', 'PLANNED', 'COMPLETED', 'CANCELLED'])
  status!: 'DRAFT' | 'NEW' | 'PLANNED' | 'COMPLETED' | 'CANCELLED';
}
