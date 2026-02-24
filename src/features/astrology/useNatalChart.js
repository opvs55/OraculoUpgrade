import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { oraclesApi } from '../../services/api/oraclesApi';

export function useNatalChart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const natalQuery = useQuery({
    queryKey: ['astrology', 'natal-chart', userId],
    enabled: !!userId,
    queryFn: () => oraclesApi.getMyNatalChart(),
  });

  const generateNatalChart = useMutation({
    mutationFn: (payload) => oraclesApi.saveNatalChart(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['astrology', 'natal-chart', userId], data);
    },
  });

  return {
    natalChart: natalQuery.data,
    isLoadingNatalChart: natalQuery.isLoading,
    errorNatalChart: natalQuery.error,
    refetchNatalChart: natalQuery.refetch,
    generateNatalChart: generateNatalChart.mutateAsync,
    isGeneratingNatalChart: generateNatalChart.isPending,
    errorGeneratingNatalChart: generateNatalChart.error,
  };
}
