import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../components/common/Loader/Loader';
import { useAuth } from '../hooks/useAuth';
import { oraclesApi } from '../services/api/oraclesApi';
import styles from './RunesWeeklyPage.module.css';

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
    module,
    output: module?.output_payload ?? module?.outputPayload ?? {},
  };
};

export default function RunesWeeklyPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [allowRegenerate, setAllowRegenerate] = useState(false);

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

  const status = normalized.status;
  const module = normalized.module;
  const output = normalized.output;
  const hasModule = !!module;
  const isStatusOk = hasModule && status === 'ok';
  const isStatusError = hasModule && status === 'error';

  const runesDrawn =
    output?.runes_sorteadas || output?.runas_sorteadas || output?.runes_drawn || output?.runes || [];

  const themes = toList(output?.temas || output?.themes);
  const advice = toList(output?.conselhos || output?.conselho || output?.advice);
  const meanings =
    (Array.isArray(output?.significados) && output.significados) ||
    (Array.isArray(output?.meanings) && output.meanings) ||
    [];

  const shadow = output?.sombra || output?.atencao || output?.atenção || output?.shadow;

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
        {weeklyQuery.isLoading && <Loader />}

        {weeklyQuery.isError && (
          <div className={styles.errorCard}>
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
                  <span className={styles.cacheInfo}>Já gerado nesta semana</span>
                </div>

                <div className={styles.resultCard}>
                  <h2>Runas sorteadas</h2>
                  <div className={styles.runeRow}>
                    {toList(runesDrawn).map((rune) => (
                      <span key={rune} className={styles.runeChip}>{rune}</span>
                    ))}
                  </div>

                  {meanings.length > 0 && (
                    <div className={styles.meaningsGrid}>
                      {meanings.map((meaning, index) => {
                        const title = meaning?.runa || meaning?.nome || `Runa ${index + 1}`;
                        const text = meaning?.significado || meaning?.interpretacao || meaning?.texto;
                        return (
                          <article className={styles.meaningCard} key={`${title}-${index}`}>
                            <h3>{title}</h3>
                            <p>{text || 'Sem descrição disponível.'}</p>
                          </article>
                        );
                      })}
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

                  {advice.length > 0 && (
                    <div className={styles.sectionBlock}>
                      <h3>Conselho</h3>
                      <ul>
                        {advice.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {shadow && (
                    <div className={styles.sectionBlock}>
                      <h3>Atenção / Sombra</h3>
                      <p>{shadow}</p>
                    </div>
                  )}

                  <p className={styles.footerText}>Gerado para {normalized.weekRef || 'a semana atual'}.</p>
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

            {isStatusOk && (
              <div className={styles.advancedBox}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={allowRegenerate}
                    onChange={(event) => setAllowRegenerate(event.target.checked)}
                  />
                  Ativar opções avançadas
                </label>
                {allowRegenerate && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => handleGenerate(true)}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? 'Regenerando...' : 'Gerar novamente'}
                  </button>
                )}
              </div>
            )}

            {generateMutation.isError && (
              <p className={styles.inlineError}>
                {generateMutation.error?.message || 'Não foi possível gerar sua leitura de runas.'}
              </p>
            )}

            {hasModule && (
              <details className={styles.techDetails}>
                <summary>Ver dados técnicos</summary>
                <pre>{JSON.stringify(output, null, 2)}</pre>
              </details>
            )}
          </>
        )}
      </section>
    </div>
  );
}
