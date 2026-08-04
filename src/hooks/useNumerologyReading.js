import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useNumerology } from '../features/numerology/useNumerology';
import { oraclesApi } from '../services/api/oraclesApi';

export function useNumerologyReading() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const {
    personalNumerology,
    isLoadingPersonal,
    errorPersonal,
    refetchPersonal,
    calculatePersonal,
    isCalculatingPersonal,
    errorCalculatingPersonal,
  } = useNumerology();

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Você precisa estar logado para resetar.');

      await oraclesApi.resetPersonalNumerology();
      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(['numerology', 'personal', userId], null);
    },
  });

  return {
    numerologyData: personalNumerology,
    isLoadingReading: isLoadingPersonal,
    errorLoadingReading: errorPersonal,
    refetchReading: refetchPersonal,
    calculateNumerology: ({ birthDate }) => calculatePersonal({ birthDate }),
    isCalculating: isCalculatingPersonal,
    errorCalculating: errorCalculatingPersonal,
    isSuccessCalculating: false,
    resetCalculationState: () => {},
    resetNumerology: () => resetMutation.mutateAsync(),
    isResetting: resetMutation.isPending,
    errorResetting: resetMutation.error,
    isSuccessResetting: resetMutation.isSuccess,
    resetResetState: resetMutation.reset,
  };
}
