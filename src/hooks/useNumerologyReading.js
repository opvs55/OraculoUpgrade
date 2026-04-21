import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNumerology } from '../features/numerology/useNumerology';

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

      const [r1, r2] = await Promise.all([
        supabase.from('numerology_readings').delete().eq('user_id', userId),
        supabase.from('numerology_weekly_readings').delete().eq('user_id', userId),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;

      return true;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['numerology', 'personal', userId] });
      queryClient.removeQueries({ queryKey: ['numerology', 'weekly', userId] });
      queryClient.invalidateQueries({ queryKey: ['numerology'] });
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
