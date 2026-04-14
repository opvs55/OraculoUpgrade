// src/pages/NumerologyPage.jsx (O NOVO GESTOR)
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Verifique o caminho
import { useNumerologyReading } from '../hooks/useNumerologyReading'; // Verifique o caminho
import NumberLoader from '../components/common/NumberLoader/NumberLoader'; // Verifique o caminho
import NumerologyForm from '../components/numerology/NumerologyForm'; // <<< NOVO
import NumerologyResults from '../components/numerology/NumerologyResults'; // <<< NOVO
import styles from './NumerologyPage.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { oraclesApi } from '../services/api/oraclesApi';

function NumerologyPage() {
  const { user } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [formError, setFormError] = useState(null);
  const queryClient = useQueryClient();

  // O hook de dados (sem alterações)
  const {
    numerologyData, isLoadingReading, errorLoadingReading, refetchReading,
    calculateNumerology, isCalculating, errorCalculating, resetCalculationState,
    resetNumerology, isResetting, errorResetting, isSuccessResetting, resetResetState
  } = useNumerologyReading();

  const weeklyNumerologyQuery = useQuery({
    queryKey: ['numerology', 'weekly', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('numerology_weekly_readings')
        .select('id, week_start, week_ref, result_payload, input_payload, created_at, updated_at')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },
  });

  const getWeekStart = (date = new Date()) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10);
  };

  const weeklyMutation = useMutation({
    mutationFn: async ({ birthDateInput }) => {
      const weekStart = getWeekStart();
      const apiData = await oraclesApi.getWeeklyNumerology({
        birthDate: birthDateInput,
        userId: user.id,
        weekStart,
      });
      const payload = {
        user_id: user.id,
        week_start: weekStart,
        week_ref: `${weekStart}`,
        result_payload: apiData,
        input_payload: { birthDate: birthDateInput },
      };
      const { data, error } = await supabase
        .from('numerology_weekly_readings')
        .upsert(payload, { onConflict: 'user_id,week_start' })
        .select('id, week_start, week_ref, result_payload, input_payload, created_at, updated_at')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['numerology', 'weekly', user?.id], data);
      queryClient.invalidateQueries({ queryKey: ['numerology', 'weekly', user?.id] });
    },
  });

  const weeklySummary = useMemo(() => {
    const payload = weeklyNumerologyQuery.data?.result_payload || null;
    if (!payload) return null;
    return {
      headline:
        payload?.headline
        || payload?.summary
        || payload?.weekly_focus
        || 'Leitura semanal de numerologia pronta.',
      focus:
        payload?.weekly_focus
        || payload?.focus
        || payload?.focus_of_week
        || payload?.energy
        || '',
    };
  }, [weeklyNumerologyQuery.data]);

  // Efeito para limpar o formulário (sem alterações)
  useEffect(() => {
    if (isSuccessResetting) {
      setBirthDate('');
      setFormError(null);
    }
  }, [isSuccessResetting]);

  // Handler para submeter form (calcular)
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    resetCalculationState();
    resetResetState();

    if (!birthDate) { setFormError("Insira sua data."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) { setFormError("Formato inválido."); return; }

    if (user) {
      calculateNumerology({ birthDate, user });
    } else {
      setFormError("Você precisa estar logado para calcular.");
    }
  };

  const handleGenerateWeekly = async () => {
    setFormError(null);
    if (!user) {
      setFormError('Você precisa estar logado para gerar sua leitura semanal.');
      return;
    }
    const effectiveBirthDate = birthDate || numerologyData?.input_birth_date;
    if (!effectiveBirthDate) {
      setFormError('Para gerar a leitura semanal, informe sua data no campo acima.');
      return;
    }
    try {
      await weeklyMutation.mutateAsync({ birthDateInput: effectiveBirthDate });
    } catch (error) {
      setFormError(error?.message || 'Não foi possível gerar a numerologia semanal.');
    }
  };

  // Handler para resetar leitura
  const handleResetReading = () => {
    if (!user) { alert("Você precisa estar logado."); return; }
    if (window.confirm("Tem certeza que deseja apagar sua leitura? Poderá calcular uma nova.")) {
      resetNumerology({ user });
    }
  };

  // Handler para "Tentar Novamente" / Recarregar
  const handleRetry = () => {
    setBirthDate('');
    setFormError(null);
    resetCalculationState();
    resetResetState();
    if (errorLoadingReading) {
      refetchReading();
    }
  };

  // --- Renderização Principal da Página ---
  
  // Função interna para decidir o que renderizar
  const renderContent = () => {
    // 1. Loading
    if (isLoadingReading || isCalculating || isResetting) {
      return <NumberLoader />;
    }

    // 2. Erro
    // (Lógica de erro combinada para simplificar)
    const combinedError = errorLoadingReading || errorCalculating || errorResetting;
    if (combinedError) {
      return (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            Ocorreu um erro: {combinedError.message}
          </p>
          <button onClick={handleRetry} className={styles.secondaryButton}>
            Tentar Novamente
          </button>
        </div>
      );
    }

    // 3. Resultados ou Formulário
    // Se temos dados E não acabámos de resetar, mostra os resultados
    if (numerologyData && !isSuccessResetting) {
      return (
        <NumerologyResults
          resultData={numerologyData}
          onReset={handleResetReading}
          isResetting={isResetting}
          errorResetting={errorResetting}
        />
      );
    }

    // 4. Se não, mostra o formulário
    return (
      <NumerologyForm
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        formError={formError}
        handleSubmit={handleSubmit}
        isCalculating={isCalculating}
        isSuccessResetting={isSuccessResetting}
      />
    );
  };

  return (
    <div className={`content_wrapper ${styles.pageContainer}`}>
      <div className={styles.content}>
        <header className={styles.headerIntro}>
          <h1 className={styles.headerTitle}>Numerologia Pessoal</h1>
          <p className={styles.headerSubtitle}>
            Descubra seu caminho de vida e o arquétipo do seu nascimento com uma leitura clara,
            elegante e prática para sua rotina.
          </p>
        </header>
        <section className={styles.dynamicSplitSection}>
          <article className={`${styles.dynamicCard} ${styles.personalCard}`}>
            <p className={styles.dynamicLabel}>Canal Pessoal</p>
            <h3>Número de Vida + Arquétipo Natal</h3>
            <p>
              Leitura profunda baseada na sua data de nascimento. É sua base permanente
              e íntima de autoconhecimento.
            </p>
            <span className={styles.dynamicMeta}>
              {numerologyData?.created_at
                ? `Atualizado em ${new Date(numerologyData.created_at).toLocaleDateString('pt-BR')}`
                : 'Ainda não calculado'}
            </span>
          </article>
          <article className={`${styles.dynamicCard} ${styles.weeklyCard}`}>
            <p className={styles.dynamicLabel}>Canal Semanal</p>
            <h3>Numerologia da Semana</h3>
            <p>
              Direção de curto prazo para seu ciclo atual. Complementa sua base pessoal
              com foco prático para agora.
            </p>
            {weeklySummary ? (
              <div className={styles.weeklySummary}>
                <strong>{weeklySummary.headline}</strong>
                {weeklySummary.focus && <span>{weeklySummary.focus}</span>}
              </div>
            ) : (
              <span className={styles.dynamicMeta}>Ainda não gerado nesta semana.</span>
            )}
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleGenerateWeekly}
              disabled={weeklyMutation.isPending || isLoadingReading || isCalculating || isResetting}
            >
              {weeklyMutation.isPending ? 'Gerando semanal...' : 'Gerar leitura semanal'}
            </button>
          </article>
        </section>
        {renderContent()}
      </div>
    </div>
  );
}

export default NumerologyPage;
