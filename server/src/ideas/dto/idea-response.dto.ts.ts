export class IdeaResponseDto {
  id!: string;
  title!: string;
  shortDescription!: string;
  coverImageUrl?: string | null;
  status!: string;
  createdAt!: Date;

  createdBy!: {
    id: string;
    username: string;
    fullName?: string | null;
  };

  tags!: {
    id: string;
    name: string;
    color?: string | null;
  }[];
}
