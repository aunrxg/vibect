import { z } from "zod";

export const voteSchema = z.object({
  songId: z.uuid("Invalid song ID"),
  value: z.number().int().min(-1).max(1), // downvote: -1, remove: 0, upvote: 1
});

export const removeVoteSchema = z.object({
  songId: z.uuid("Invalid song ID"),
});

export const getUserVoteSchema = z.object({
  spaceId: z.uuid("Invalid space ID"),
});

export const getSongVotesSchema = z.object({
  songId: z.uuid("Invalid song ID"),
});

export type VoteSchemaType = z.infer<typeof voteSchema>;
export type RemoveVoteSchemaType = z.infer<typeof removeVoteSchema>;
export type GetUserVoteSchemaType = z.infer<typeof getUserVoteSchema>;
export type GetSongVotesSchemaType = z.infer<typeof getSongVotesSchema>;
