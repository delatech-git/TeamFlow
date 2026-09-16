export function publishAiSummaryToPlannedEvents(_params: {
  ideaSlug: string;
  ideaTitle: string;
  summary: string;
  pinnedNotes: string[];
}): { id: string } {
  return { id: crypto.randomUUID() };
}
