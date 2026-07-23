import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/client";

export type PlannedIdeaCard = {
  id: string;
  title: string;
  summary: string;
  createdAtLabel: string;
  updatedLabel: string;
  owner: string;
  status: string;
  coverImageUrl: string | null;
};

export function toPlannedIdeaCard(dto: IdeaResponseDto): PlannedIdeaCard {
  const createdAt = new Date(dto.createdAt);

  return {
    id: dto.id,
    title: dto.title,
    summary: dto.plannedGuide?.summary ?? dto.shortDescription,
    createdAtLabel: createdAt.toLocaleDateString(),
    updatedLabel: new Date(dto.updatedAt ?? dto.createdAt).toLocaleDateString(),
    owner: dto.createdBy.fullName || dto.createdBy.username,
    status: dto.status,
    coverImageUrl: dto.coverImageUrl ?? null,
  };
}
