import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../components/common/Loader/Loader';
import { useAuth } from '../hooks/useAuth';
import { oraclesApi } from '../services/api/oraclesApi';
import HexagramDisplay from '../components/iching/HexagramDisplay';
import styles from './IChingWeeklyPage.module.css';

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n|•|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeWeeklyData = (payload) => {
  const source = payload?.data ?? payload ?? {};
  const module = source?.module ?? null;

  return {
    status: source?.status ?? module?.status ?? null,
    weekRef: source?.week_ref ?? module?.week_ref ?? null,
    cached: Boolean(source?.cached ?? module?.cached),
    module,
    output: module?.output_payload ?? module?.outputPayload ?? {},
  };
};

export default function IChingWeeklyPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const weeklyQuery = useQuery({
    queryKey: ['oracles', 'iching', 'weekly', 'me', userId],
    queryFn: () => oraclesApi.getMyIChingWeekly(),
    enabled: !!userId,
  });

  const generateMutation = useMutation({
    mutationFn: (payload) => oraclesApi.generateIChingWeekly(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oracles', 'iching', 'weekly', 'me', userId] });
    },
  });

  const normalized = useMemo(() => normalizeWeeklyData(weeklyQuery.data), [weeklyQuery.data]);

  const { status, module, output } = normalized;
  const hasModule = !!module;
  const isStatusOk = hasModule && status === 'ok';
  const isStatusError = hasModule && status === 'error';

  const headline = output?.headline || 'Mensagem da semana';
  const summary = output?.summary;
  const themes = toList(output?.themes);
  const recommendedActions = toList(output?.recommended_actions);
  const disclaimer = output?.disclaimer;
  const hexagramLines = Array.isArray(output?.lines) ? output.lines : [];

  const handleGenerate = (forceRegenerate = false) => {
    generateMutation.mutate({
      force_regenerate: forceRegenerate,
    });
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Oráculos</p>
        <h1>I Ching Semanal</h1>
        <p className={styles.subtitle}>Hexagrama da semana para clareza, direção e equilíbrio interior.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {weeklyQuery.isLoading && <Loader />}

        {weeklyQuery.isError && (
          <div className={styles.errorCard}>
            <h2>Falha ao carregar a leitura semanal</h2>
            <p>{weeklyQuery.error?.message || 'Não foi possível carregar seu módulo semanal de I Ching.'}</p>
            <button type="button" className={styles.primaryButton} onClick={() => weeklyQuery.refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {!weeklyQuery.isLoading && !weeklyQuery.isError && (
          <>
            {isStatusOk && (
              <>
                <div className={styles.statusRow}>
                  <span className={styles.badge}>Semanal • {normalized.weekRef || 'Semana atual'}</span>
                  {normalized.cached && <span className={styles.cacheInfo}>Já gerado nesta semana</span>}
                </div>

                <div className={styles.resultCard}>
                  <div className={styles.messageCard}>
                    <h2>{headline}</h2>
                    {summary && <p>{summary}</p>}
                  </div>

                  <HexagramDisplay lines={hexagramLines} />

                  {/* TODO: alinhar backend para sempre enviar output_payload.lines com as 6 linhas do hexagrama. */}

                  {themes.length > 0 && (
                    <div className={styles.sectionBlock}>
                      <h3>Temas</h3>
                      <div className={styles.chipsRow}>
                        {themes.map((theme) => (
                          <span key={theme} className={styles.themeChip}>{theme}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendedActions.length > 0 && (
                    <div className={styles.sectionBlock}>
                      <h3>Ações recomendadas</h3>
                      <ul>
                        {recommendedActions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {disclaimer && (
                    <div className={styles.sectionBlock}>
                      <h3>Nota</h3>
                      <p className={styles.disclaimer}>{disclaimer}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {isStatusError && (
              <div className={styles.errorCard}>
                <h2>Falha ao processar este módulo</h2>
                <p>{module?.error_message || module?.message || 'Houve um problema ao montar a leitura semanal.'}</p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleGenerate(true)}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? 'Canalizando novamente...' : 'Tentar novamente'}
                </button>
              </div>
            )}

            {!hasModule && (
              <div className={styles.emptyState}>
                <p>Seu módulo semanal de I Ching ainda não foi gerado.</p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleGenerate(false)}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? 'Gerando...' : 'Gerar I Ching da Semana'}
                </button>
              </div>
            )}

            {generateMutation.isError && (
              <p className={styles.inlineError}>
                {generateMutation.error?.message || 'Não foi possível gerar sua leitura de I Ching.'}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
