const extractVideoInfo = (
  url: string,
): { platform: "youtube" | "spotify"; id: string } | null => {
  // const youtubePattern = [
  //   /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  //   /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  // ]

  // for(const pattern of youtubePattern) {
  //   const match = url.match(pattern);
  //   if(match) {
  //     return { platform: "youtube", id: match[1] }
  //   }
  // }
  // return null;
  try {
    const parsed = new URL(url);

    //case 1. normal url
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.searchParams.has("v")
    ) {
      return { id: parsed.searchParams.get("v"), platform: "youtube" };
    }

    // case 2. youtu.be
    if (parsed.hostname === "youtu.be") {
      return {
        id: parsed.pathname.slice(1).split("?")[0],
        platform: "youtube",
      };
    }

    // case 3. embed link
    if (parsed.pathname.startsWith("/embed/")) {
      return {
        id: parsed.pathname.split("/embed/")[1].split("?")[0],
        platform: "youtube",
      };
    }

    return null;
  } catch {
    return null; // invalid url
  }
};

export function normalizeYouTubeUrl(url: string): string | null {
  const id = extractVideoInfo(url);
  return id ? `https://youtube.com/watch?v=${id}` : null;
}

export default extractVideoInfo;
