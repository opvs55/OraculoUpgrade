// src/pages/NumerologyPage.jsx (O NOVO GESTOR)
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Verifique o caminho
import { useNumerologyReading } from '../hooks/useNumerologyReading'; // Verifique o caminho
import NumberLoader from '../components/common/NumberLoader/NumberLoader'; // Verifique o caminho
import NumerologyForm from '../components/numerology/NumerologyForm'; // <<< NOVO
import NumerologyResults from '../components/numerology/NumerologyResults'; // <<< NOVO
import styles from './NumerologyPage.module.css';
import { usePageTitle } from '../hooks/usePageTitle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { oraclesApi } from '../services/api/oraclesApi';

function NumerologyPage() {
  usePageTitle('Numerologia');
  const { user } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [formError, setFormError] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
      const data = await oraclesApi.getWeeklyNumerology({
        birthDate: birthDateInput,
        userId: user.id,
        weekStart,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numerology', 'weekly', user?.id] });
    },
  });

  const currentWeekRef = useMemo(() => {
    const now = new Date();
    const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }, []);

  const weeklySummary = useMemo(() => {
    if (!weeklyNumerologyQuery.data) return null;

    const unwrap = (obj, depth = 0) => {
      if (!obj || depth > 8) return obj;
      if (obj?.narrative || obj?.themes || obj?.life_path_number) return obj;
      if (obj?.result_payload) return unwrap(obj.result_payload, depth + 1);
      return obj;
    };

    const raw = unwrap(weeklyNumerologyQuery.data);
    if (!raw) return null;

    const weekRef = raw?.week_ref || weeklyNumerologyQuery.data?.week_ref || null;
    return {
      narrative: raw?.narrative || null,
      themes: Array.isArray(raw?.themes) ? raw.themes : [],
      lifePathNumber: raw?.life_path_number || null,
      personalWeekVibe: raw?.personal_week_vibe || null,
      weekRef,
      isCurrentWeek: weekRef === currentWeekRef,
      headline: raw?.headline || raw?.summary || raw?.weekly_focus || 'Leitura semanal pronta.',
    };
  }, [weeklyNumerologyQuery.data, currentWeekRef]);

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
    if (!user) return;
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    resetNumerology({ user });
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
      {showResetConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
          <div className={styles.modalBox}>
            <p className={styles.modalTitle} id="reset-modal-title">Apagar leitura?</p>
            <p className={styles.modalDesc}>Sua numerologia pessoal será removida e você poderá calcular uma nova. Esta ação não pode ser desfeita.</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalConfirm} onClick={handleConfirmReset}>Sim, apagar</button>
              <button type="button" className={styles.modalCancel} onClick={() => setShowResetConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.content}>
        <header className={styles.headerIntro}>
          <h1 className={styles.headerTitle}>Numerologia Pessoal</h1>
          <p className={styles.headerSubtitle}>
            Descubra seu caminho de vida e o arquétipo do seu nascimento com uma leitura clara,
            elegante e prática para sua rotina.
          </p>
        </header>
        {/* heroSplit só aparece quando já existem dados */}
        {numerologyData && (
          <section className={styles.heroSplit}>
            <div className={styles.numberVisual}>
              <div className={styles.numberGlyph}>{numerologyData.life_path_number}</div>
              <p className={styles.numberLabel}>Caminho de Vida</p>
              {numerologyData.birthday_number && (
                <p className={styles.numberSub}>Nascimento · {numerologyData.birthday_number}</p>
              )}
              {numerologyData.created_at && (
                <p className={styles.numberDate}>
                  Base desde {new Date(numerologyData.created_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            <div className={styles.weeklyPanel}>
              <div className={styles.weeklyPanelHeader}>
                <p className={styles.dynamicLabel}>Canal Semanal</p>
                <h2 className={styles.weeklyPanelTitle}>Numerologia da Semana</h2>
                <p className={styles.weeklyPanelSub}>Direção de curto prazo para seu ciclo atual.</p>
              </div>

              {weeklySummary ? (
                <div className={styles.weeklySummary}>
                  {!weeklySummary.isCurrentWeek && (
                    <span className={styles.weeklyStale}>Leitura da semana anterior · Gere uma nova abaixo</span>
                  )}
                  {weeklySummary.personalWeekVibe && (
                    <span className={styles.weeklyVibe}>
                      Vibração {weeklySummary.personalWeekVibe} · {weeklySummary.weekRef}
                    </span>
                  )}
                  {weeklySummary.narrative && (
                    <p className={styles.weeklyNarrative}>{weeklySummary.narrative}</p>
                  )}
                  {weeklySummary.themes.length > 0 && (
                    <ul className={styles.weeklyThemes}>
                      {weeklySummary.themes.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  )}
                </div>
              ) : (
                <p className={styles.weeklyEmpty}>Nenhuma leitura semanal gerada ainda.</p>
              )}

              {formError && <p className={styles.weeklyError}>{formError}</p>}

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleGenerateWeekly}
                disabled={weeklyMutation.isPending || isLoadingReading || isCalculating || isResetting}
              >
                {weeklyMutation.isPending ? '❆ Gerando...' : weeklySummary?.isCurrentWeek ? 'Atualizar leitura semanal' : 'Gerar leitura semanal'}
              </button>
            </div>
          </section>
        )}

        {renderContent()}
      </div>
    </div>
  );
}

export default NumerologyPage;
