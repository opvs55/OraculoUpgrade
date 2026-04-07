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

const pickText = (payload, keys) => {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const pickList = (payload, keys) => {
  for (const key of keys) {
    const value = toList(payload?.[key]);
    if (value.length > 0) return value;
  }
  return [];
};

const normalizeWeeklyData = (payload) => {
  const root = payload ?? {};
  const source = root?.data?.data ?? root?.data ?? root;
  const module = source?.module ?? null;

  return {
    status: source?.status ?? module?.status ?? null,
    weekRef: source?.week_ref ?? module?.week_ref ?? null,
    cached: Boolean(source?.cached ?? module?.cached),
    module,
    outputPayload: module?.output_payload ?? module?.outputPayload ?? {},
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

  const { status, module, outputPayload } = normalized;
  const hasModule = !!module;
  const isStatusOk = hasModule && status === 'ok';
  const isStatusError = hasModule && status === 'error';

  const headline = outputPayload?.headline || 'Mensagem da semana';
  const summary = outputPayload?.summary;
  const themes = toList(outputPayload?.themes);
  const recommendedActions = toList(outputPayload?.recommended_actions);
  const disclaimer = outputPayload?.disclaimer;
  const hexagramLines = Array.isArray(outputPayload?.lines) ? outputPayload.lines : [];
  const hasHexagramLines = hexagramLines.length === 6;
  const mutatingLines = pickList(outputPayload, ['mutating_lines', 'changing_lines']);
  const strategicMoves = pickList(outputPayload, ['strategic_moves', 'strategic_actions', 'advanced_guidance']);
  const cautionPoints = pickList(outputPayload, ['cautions', 'warnings', 'attention_points']);
  const reflectionQuestions = pickList(outputPayload, ['reflection_questions', 'journal_prompts']);
  const hexagramName = pickText(outputPayload, ['hexagram_name', 'hexagram_title', 'title']);
  const upperTrigram = pickText(outputPayload, ['upper_trigram', 'trigram_upper']);
  const lowerTrigram = pickText(outputPayload, ['lower_trigram', 'trigram_lower']);
  const movingInterpretation = pickText(outputPayload, ['moving_lines_interpretation', 'movement_reading']);

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

                  {hasHexagramLines ? (
                    <HexagramDisplay lines={hexagramLines} />
                  ) : (
                    <p className={styles.soonNote}>Hexagrama visual disponível em breve.</p>
                  )}

                  {(hexagramName || upperTrigram || lowerTrigram || movingInterpretation) && (
                    <div className={styles.sectionBlock}>
                      <h3>Estrutura do hexagrama</h3>
                      <div className={styles.structureGrid}>
                        {hexagramName && (
                          <article className={styles.structureCard}>
                            <h4>Hexagrama</h4>
                            <p>{hexagramName}</p>
                          </article>
                        )}
                        {upperTrigram && (
                          <article className={styles.structureCard}>
                            <h4>Trigrama superior</h4>
                            <p>{upperTrigram}</p>
                          </article>
                        )}
                        {lowerTrigram && (
                          <article className={styles.structureCard}>
                            <h4>Trigrama inferior</h4>
                            <p>{lowerTrigram}</p>
                          </article>
                        )}
                      </div>
                      {movingInterpretation && (
                        <p><strong>Movimento das linhas:</strong> {movingInterpretation}</p>
                      )}
                    </div>
                  )}

                  {(strategicMoves.length > 0 || cautionPoints.length > 0 || mutatingLines.length > 0) && (
                    <div className={styles.sectionBlock}>
                      <h3>Camada estratégica</h3>
                      <div className={styles.strategyGrid}>
                        {strategicMoves.length > 0 && (
                          <div className={styles.strategyCard}>
                            <h4>Movimentos recomendados</h4>
                            <ul>
                              {strategicMoves.map((item) => (
                                <li key={`sm-${item}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {cautionPoints.length > 0 && (
                          <div className={styles.strategyCard}>
                            <h4>Pontos de atenção</h4>
                            <ul>
                              {cautionPoints.map((item) => (
                                <li key={`cp-${item}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {mutatingLines.length > 0 && (
                        <>
                          <h4 className={styles.nestedTitle}>Linhas mutantes</h4>
                          <ul>
                            {mutatingLines.map((item) => (
                              <li key={`ml-${item}`}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

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

                  {reflectionQuestions.length > 0 && (
                    <div className={styles.sectionBlock}>
                      <h3>Perguntas de reflexão</h3>
                      <ul>
                        {reflectionQuestions.map((question) => (
                          <li key={`rq-${question}`}>{question}</li>
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
