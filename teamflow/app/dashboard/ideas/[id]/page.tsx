import { notFound } from "next/navigation";

import IdeaBoard from "@/app/__components/sections/ideaBoard";
import { getIdeaById } from "@/src/infrastructure/api/ideas/server";
import { ideaResponseToDiscoverIdea } from "@/src/entities/models/discover";

export default async function IdeaBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dto = await getIdeaById(id);
  if (!dto) {
    notFound();
  }

  return <IdeaBoard idea={ideaResponseToDiscoverIdea(dto)} />;
}
