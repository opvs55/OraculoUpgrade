// src/hooks/useReadingState.js
// Hook unificado para gerenciar estados complexos de leitura

import { useMemo, useCallback } from 'react';

export const READING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  GENERATING: 'generating',
  SUCCESS: 'success',
  ERROR: 'error',
  REQUIREMENTS_MISSING: 'requirements_missing'
};

export function useReadingState({
  requirements,
  currentReading,
  isGenerating,
  isLoading,
  error,
  canGenerate
}) {
  // Estado unificado baseado em múltiplas condições
  const state = useMemo(() => {
    if (isLoading || isGenerating) {
      return isGenerating ? READING_STATES.GENERATING : READING_STATES.LOADING;
    }
    
    if (error) {
      return READING_STATES.ERROR;
    }
    
    if (!canGenerate && requirements) {
      return READING_STATES.REQUIREMENTS_MISSING;
    }
    
    if (currentReading?.final_reading) {
      return READING_STATES.SUCCESS;
    }
    
    return READING_STATES.IDLE;
  }, [requirements, currentReading, isGenerating, isLoading, error, canGenerate]);

  // Mensagens amigáveis baseadas no estado
  const stateMessage = useMemo(() => {
    switch (state) {
      case READING_STATES.LOADING:
        return 'Carregando suas leituras...';
      case READING_STATES.GENERATING:
        return 'Canalizando sua síntese integrada...';
      case READING_STATES.REQUIREMENTS_MISSING:
        return 'Complete os oráculos semanais para desbloquear a síntese';
      case READING_STATES.ERROR:
        return error?.message || 'Ocorreu um erro inesperado';
      case READING_STATES.SUCCESS:
        return 'Síntese integrada gerada com sucesso!';
      default:
        return 'Pronto para gerar sua síntese semanal';
    }
  }, [state, error]);

  // Verificações úteis
  const isIdle = state === READING_STATES.IDLE;
  const isLoadingState = state === READING_STATES.LOADING;
  const isGeneratingState = state === READING_STATES.GENERATING;
  const isSuccessState = state === READING_STATES.SUCCESS;
  const isErrorState = state === READING_STATES.ERROR;
  const hasRequirementsMissing = state === READING_STATES.REQUIREMENTS_MISSING;

  return {
    state,
    stateMessage,
    isIdle,
    isLoading: isLoadingState,
    isGenerating: isGeneratingState,
    isSuccess: isSuccessState,
    isError: isErrorState,
    hasRequirementsMissing,
    canProceed: isIdle || (isSuccessState && canGenerate)
  };
}
