import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '../services/api/journalApi';

const ENTRIES_PER_PAGE = 10;

export function useJournalEntries(userId) {
  const queryClient = useQueryClient();
  const queryKey = ['journalEntries', userId];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return { data: [], count: 0 };
      return journalApi.listEntries({ limit: ENTRIES_PER_PAGE, offset: pageParam * ENTRIES_PER_PAGE });
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.flatMap((page) => page.data).length;
      if (lastPage.count && loadedCount < lastPage.count) {
        return allPages.length;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (content) => journalApi.createEntry(content),
    onSuccess: (newEntry) => {
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const [firstPage, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            { ...firstPage, data: [newEntry, ...firstPage.data], count: firstPage.count + 1 },
            ...rest,
          ],
        };
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => journalApi.deleteEntry(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((entry) => entry.id !== id),
            count: Math.max(page.count - 1, 0),
          })),
        };
      });
    },
  });

  const reflectMutation = useMutation({
    mutationFn: ({ id, cardName }) => journalApi.reflectOnEntry(id, cardName),
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
          })),
        };
      });
    },
  });

  return {
    ...query,
    queryKey,
    entries: query.data?.pages.flatMap((page) => page.data) || [],
    totalCount: query.data?.pages?.[0]?.count || 0,
    createEntry: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    deleteEntry: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    reflectOnEntry: reflectMutation.mutate,
    isReflecting: reflectMutation.isPending,
    reflectingId: reflectMutation.variables?.id ?? null,
  };
}
