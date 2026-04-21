import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../components/common/Loader/Loader';
import { useAuth } from '../hooks/useAuth';
import { oraclesApi } from '../services/api/oraclesApi';
import RunesCast from '../components/runes/RunesCast';
import styles from './RunesWeeklyPage.module.css';
import { usePageTitle } from '../hooks/usePageTitle';

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

export default function RunesWeeklyPage() {
  usePageTitle('Runas Semanais');
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const weeklyQuery = useQuery({
    queryKey: ['oracles', 'runes', 'weekly', 'me', userId],
    queryFn: () => oraclesApi.getMyRunesWeekly(),
    enabled: !!userId,
  });

  const generateMutation = useMutation({
    mutationFn: (payload) => oraclesApi.generateRunesWeekly(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oracles', 'runes', 'weekly', 'me', userId] });
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
  const opportunities = pickList(outputPayload, ['opportunities', 'openings', 'favorable_movements']);
  const cautionPoints = pickList(outputPayload, ['cautions', 'warnings', 'attention_points']);
  const reflectionQuestions = pickList(outputPayload, ['journal_prompts', 'reflection_questions']);
  const runes = Array.isArray(outputPayload?.runes) ? outputPayload.runes : [];
  const energeticSignature = pickText(outputPayload, ['energetic_signature', 'energetic_flow', 'energy_signature']);
  const suggestedRitual = pickText(outputPayload, ['weekly_ritual', 'ritual', 'focus_ritual']);
  const runeDeepDive = runes
    .map((rune, index) => ({
      key: rune?.key || rune?.name || `runa-${index}`,
      position: rune?.position || ['Passado', 'Presente', 'Futuro'][index],
      name: rune?.name || rune?.key || 'Runa',
      meaning: rune?.meaning || rune?.message || rune?.insight || '',
      advice: rune?.advice || rune?.guidance || '',
      shadow: rune?.shadow || rune?.challenge || '',
    }))
    .filter((item) => item.meaning || item.advice || item.shadow);

  const handleGenerate = (forceRegenerate = false) => {
    generateMutation.mutate({
      force_regenerate: forceRegenerate,
    });
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Oráculos</p>
        <h1>Runas Semanais</h1>
        <p className={styles.subtitle}>Um mapa simbólico da semana com o tom do seu grimório.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {weeklyQuery.isLoading && (
          <div className={styles.loadingBlock}>
            <Loader />
            <p className={styles.loadingHint}>Conectando ao oráculo… pode levar alguns segundos.</p>
          </div>
        )}

        {weeklyQuery.isError && (
          <div className={styles.errorCard}>
            <h2>Falha ao carregar a leitura semanal</h2>
            <p>{weeklyQuery.error?.message || 'Não foi possível carregar seu módulo semanal de Runas.'}</p>
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

                  <RunesCast runes={outputPayload?.runes || []} />

                  {runeDeepDive.length > 0 && (
                    <div className={styles.sectionBlock}>
                      <h3>Leitura por posição</h3>
                      <div className={styles.deepDiveGrid}>
                        {runeDeepDive.map((item) => (
                          <article key={`${item.key}-${item.position}`} className={styles.deepDiveCard}>
                            <p className={styles.deepDiveTitle}>{item.position} • {item.name}</p>
                            {item.meaning && <p><strong>Leitura:</strong> {item.meaning}</p>}
                            {item.advice && <p><strong>Conselho:</strong> {item.advice}</p>}
                            {item.shadow && <p><strong>Atenção:</strong> {item.shadow}</p>}
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {(opportunities.length > 0 || cautionPoints.length > 0) && (
                    <div className={styles.sectionBlock}>
                      <h3>Radar da semana</h3>
                      <div className={styles.radarGrid}>
                        {opportunities.length > 0 && (
                          <div className={styles.radarCard}>
                            <h4>Oportunidades</h4>
                            <ul>
                              {opportunities.map((item) => (
                                <li key={`op-${item}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {cautionPoints.length > 0 && (
                          <div className={styles.radarCard}>
                            <h4>Pontos de atenção</h4>
                            <ul>
                              {cautionPoints.map((item) => (
                                <li key={`ca-${item}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
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

                  {(energeticSignature || suggestedRitual || reflectionQuestions.length > 0) && (
                    <div className={styles.sectionBlock}>
                      <h3>Camada avançada</h3>
                      {energeticSignature && (
                        <p><strong>Assinatura energética:</strong> {energeticSignature}</p>
                      )}
                      {suggestedRitual && (
                        <p><strong>Ritual sugerido:</strong> {suggestedRitual}</p>
                      )}
                      {reflectionQuestions.length > 0 && (
                        <>
                          <h4 className={styles.nestedTitle}>Perguntas de reflexão</h4>
                          <ul>
                            {reflectionQuestions.map((question) => (
                              <li key={`rq-${question}`}>{question}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}

                  {disclaimer && (
                    <p className={styles.disclaimerFooter}>{disclaimer}</p>
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
                <p>Seu módulo semanal de runas ainda não foi gerado.</p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleGenerate(false)}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? 'Gerando...' : 'Gerar Runas da Semana'}
                </button>
              </div>
            )}

            {generateMutation.isError && (
              <p className={styles.inlineError}>
                {generateMutation.error?.message || 'Não foi possível gerar sua leitura de runas.'}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
