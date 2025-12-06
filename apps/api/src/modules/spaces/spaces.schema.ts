import { z } from "zod";

export const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true), // we need noauth/auth required section too
});

export const getSpaceSchema = z.object({
  id: z.uuid(),
});

export const updateSpaceSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
});

export const deleteSpaceSchema = z.object({
  id: z.uuid(),
});

export const listPublicSpacesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).default(10),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type GetSpaceInput = z.infer<typeof getSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type DeleteSpaceInput = z.infer<typeof deleteSpaceSchema>;
export type ListPublicSpacesInput = z.infer<typeof listPublicSpacesSchema>;
