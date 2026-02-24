import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { oraclesApi } from '../../services/api/oraclesApi';

export function useUnifiedReading({ readingId, listParams } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const requirementsQuery = useQuery({
    queryKey: ['unified-reading', 'requirements', userId],
    queryFn: () => oraclesApi.getCentralRequirements(),
    enabled: !!userId,
  });

  const unifiedReadingsQuery = useQuery({
    queryKey: ['unified-reading', 'list', userId, listParams],
    queryFn: () => oraclesApi.getUnifiedReadings(listParams),
    enabled: !!userId,
  });

  const unifiedReadingByIdQuery = useQuery({
    queryKey: ['unified-reading', 'detail', readingId],
    queryFn: () => oraclesApi.getUnifiedReadingById(readingId),
    enabled: !!userId && !!readingId,
  });

  const createUnifiedReading = useMutation({
    mutationFn: async ({ inputPayload }) => oraclesApi.createUnifiedReading(inputPayload),
  });

  const generateCentralReading = useMutation({
    mutationFn: (payload) => oraclesApi.generateCentralReading(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-reading', 'requirements', userId] });
      queryClient.invalidateQueries({ queryKey: ['unified-reading', 'list', userId] });
    },
  });

  return {
    // legado
    createUnifiedReading: createUnifiedReading.mutateAsync,
    isCreatingUnifiedReading: createUnifiedReading.isPending,
    errorCreatingUnifiedReading: createUnifiedReading.error,

    // novo fluxo backend-centric
    requirements: requirementsQuery.data,
    isLoadingRequirements: requirementsQuery.isLoading,
    errorRequirements: requirementsQuery.error,
    refetchRequirements: requirementsQuery.refetch,

    unifiedReadings: unifiedReadingsQuery.data,
    isLoadingUnifiedReadings: unifiedReadingsQuery.isLoading,
    errorUnifiedReadings: unifiedReadingsQuery.error,
    refetchUnifiedReadings: unifiedReadingsQuery.refetch,

    unifiedReading: unifiedReadingByIdQuery.data,
    isLoadingUnifiedReading: unifiedReadingByIdQuery.isLoading,
    errorUnifiedReading: unifiedReadingByIdQuery.error,

    generateCentralReading: generateCentralReading.mutateAsync,
    isGeneratingCentralReading: generateCentralReading.isPending,
    errorGeneratingCentralReading: generateCentralReading.error,
  };
}
