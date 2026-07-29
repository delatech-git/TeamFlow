import { proxyPostFormData } from "@/src/infrastructure/api/core/fetch-client";
import { buildProxyPath } from "@/src/infrastructure/api/core/proxy-path";

export type BoardImageResult = { image: string };

/** Export-only: sends a screenshot of the board to an image-generation model and gets back a redrawn version. */
export async function requestBoardImage(
  screenshot: Blob,
  texts: string[],
  token: string,
): Promise<BoardImageResult> {
  const formData = new FormData();
  formData.append("image", screenshot, "board.jpg");
  formData.append("texts", JSON.stringify(texts));

  return proxyPostFormData<BoardImageResult>(
    buildProxyPath(["ai", "board-image"]),
    formData,
    {
      errorMessage: "Could not generate an improved diagram image.",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}
