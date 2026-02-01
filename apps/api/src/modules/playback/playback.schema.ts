import z from "zod";

export const spaceIdSchema = z.object({
  spaceId: z.string(),
});

export const startPlaybackSchema = z.object({
  spaceId: z.string(),
  songId: z.string(),
});

export type SpaceIdInput = z.infer<typeof spaceIdSchema>;
export type StartPlaybackType = z.infer<typeof startPlaybackSchema>;
