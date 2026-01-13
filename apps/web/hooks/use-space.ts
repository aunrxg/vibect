import api from "@/lib/api";
import { CreateSpaceInput, Space } from "@/lib/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePublicSpace = () => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["spaces", "public", identityKey],
    queryFn: async (): Promise<Space[]> => {
      const res = await api.get("/spaces");
      return res.data;
    },
  });
};

export const useSpace = (spaceId: string) => {
  const identityKey = useAuthStore((s) => s.identityKey());

  return useQuery({
    queryKey: ["spaces", spaceId, identityKey],
    queryFn: async (): Promise<Space> => {
      const res = await api.get(`/spaces/${spaceId}`);
      return res.data;
    },
    enabled: !!spaceId,
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return useMutation({
    mutationFn: async (data: CreateSpaceInput): Promise<Space> => {
      const res = await api.post(`/spaces`, data);
      return res.data;
    },
    onSuccess: (newSpace) => {
      // invalide public space list
      if (newSpace.isPublic) {
        queryClient.invalidateQueries({ queryKey: ["spaces", "public"] });
      }
    },
    onError: (err: any) => {
      if (err.response?.status === 401) {
        // toast
      }
    },
  });
};

export const useUpdateSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spaceId,
      data,
    }: {
      spaceId: string;
      data: Partial<CreateSpaceInput>;
    }): Promise<Space> => {
      const res = await api.patch(`/spaces/${spaceId}`, data);
      return res.data;
    },
    onSuccess: (updatedSpace) => {
      queryClient.setQueryData(["spaces", updatedSpace.id], updatedSpace);
      queryClient.invalidateQueries({ queryKey: ["spaces", "public"] });
    },
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spaceId: string): Promise<void> => {
      await api.delete(`/spaces/${spaceId}`);
    },
    onSuccess: (_, spaceId) => {
      // remove from cache
      queryClient.removeQueries({ queryKey: ["spaces", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["spaces", "public"] });
      queryClient.invalidateQueries({ queryKey: ["queue", spaceId] });
      queryClient.invalidateQueries({ queryKey: ["history", spaceId] });
    },
  });
};
