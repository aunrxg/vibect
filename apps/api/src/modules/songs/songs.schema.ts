import { z } from "zod";

export const addSongSchema = z.object({
  spaceId: z.uuid(),
  youtubeUrl: z.string().min(1, "Youtube URL is required"),
});

export const deleteSongSchema = z.object({
  id: z.uuid().min(1, "song id is required"),
});

export const getQueueQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const searchSongSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxResult: z.coerce.number().min(1).max(50).default(10),
});

export type AddSongSchema = z.infer<typeof addSongSchema>;
export type DeleteSongSchema = z.infer<typeof deleteSongSchema>;
export type GetQueueSchema = z.infer<typeof getQueueQuerySchema>;
export type SearchSongSchema = z.infer<typeof searchSongSchema>;
