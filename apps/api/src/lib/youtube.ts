import { config } from "../config";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YoutubeSearchItem {
  id: {
    videoId: string;
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      default: { url: string };
    };
  };
  contentDetails: {
    duration: number;
  };
}

export interface YoutubeVideo {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; //in sec
}

export class YoutubeService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.youtube.key || "";
    if (!this.apiKey) {
      throw new Error("Youtube api key not configured");
    }
  }

  async search(query: string, maxResult = 10): Promise<YoutubeVideo[]> {
    try {
      const url = new URL(`${YOUTUBE_API_BASE}/search`);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("q", query);
      url.searchParams.set("type", "video");
      url.searchParams.set("videoCategoryId", "10");
      url.searchParams.set("maxResult", String(maxResult));
      url.searchParams.set("key", this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Youtube API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as { items: YoutubeSearchItem[] };

      const videoIds = data.items
        .map((item) => item.id?.videoId)
        .filter(Boolean) as string[];

      return await this.getVideoDetails(videoIds);
    } catch (error) {
      console.error("Youtube search error: ", error);
      throw error;
    }
  }

  async getVideoById(videoId: string): Promise<YoutubeVideo> {
    const videos = await this.getVideoDetails([videoId]);

    const [video] = videos;
    if (!video) {
      throw new Error("Video not found");
    }

    return video;
  }

  private async getVideoDetails(videoIds: string[]): Promise<YoutubeVideo[]> {
    try {
      if (videoIds.length === 0) return [];

      const url = new URL(`${YOUTUBE_API_BASE}/videos`);
      url.searchParams.set("part", "snippet,contentDetails");
      url.searchParams.set("id", videoIds.join(","));
      url.searchParams.set("key", this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Youtube API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { items: YouTubeVideoItem[] };

      return data.items.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        duration: item.contentDetails.duration,
        thumbnail:
          item.snippet.thumbnails.high?.url ??
          item.snippet.thumbnails.default.url,
      }));
    } catch (error) {
      console.error("Youtube video details error: ", error);
      throw error;
    }
  }

  // ISO duration to seconds
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return 0;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    return hours * 3600 + minutes * 60 + seconds;
  }

  // extract videoid from url
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}
