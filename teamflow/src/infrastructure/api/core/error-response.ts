/** NestJS commonly returns `{ message: string | string[], statusCode: number }`. */
export async function getErrorMessageFromResponse(
  res: Response,
): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object" && "message" in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === "string" && m.trim()) return m.trim();
      if (Array.isArray(m)) {
        const parts = m.filter((x): x is string => typeof x === "string");
        if (parts.length) return parts.join(", ");
      }
    }
  } catch {
    /* not JSON */
  }
  return "";
}
