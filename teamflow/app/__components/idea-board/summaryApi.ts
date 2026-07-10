export type PlannedGuideDto = { id: string; summary: string };

export async function requestPlannedGuide(
  ideaId: string,
  token: string,
): Promise<PlannedGuideDto> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ideaId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message || "Could not generate planned guide.",
    );
  }

  return response.json();
}
