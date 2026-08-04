import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import { useAuth } from '../../hooks/useAuth';
import { oraclesApi } from '../../services/api/oraclesApi';
import styles from './FeaturePage.module.css';

export default function IChingActivePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState('');
  const [selectedReading, setSelectedReading] = useState(null);

  const historyQuery = useQuery({
    queryKey: ['oracles', 'iching-active', 'history', userId],
    queryFn: () => oraclesApi.getIchingActiveHistory(10),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: () => oraclesApi.createIchingActive({ question: question.trim() }),
    onSuccess: (data) => {
      setSelectedReading(data);
      setQuestion('');
      queryClient.invalidateQueries({ queryKey: ['oracles', 'iching-active', 'history', userId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim().length < 5) return;
    mutation.mutate();
  };

  const displayedReading = selectedReading || mutation.data;
  const payload = displayedReading?.result_payload;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>I Ching</p>
        <h1>Consulta Ativa</h1>
        <p className={styles.subtitle}>Faça uma pergunta específica e receba um hexagrama pra ela.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="question">Sua pergunta</label>
            <textarea
              id="question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="O que preciso saber sobre..."
              required
              minLength={5}
            />
          </div>
          <button type="submit" className={styles.primaryButton} disabled={mutation.isPending}>
            {mutation.isPending ? 'Consultando o oráculo...' : 'Consultar'}
          </button>
        </form>

        {mutation.isError && (
          <p className={styles.inlineError}>
            {mutation.error?.message || 'Não foi possível consultar o I Ching agora.'}
          </p>
        )}

        {displayedReading && payload && (
          <div className={styles.resultCard} style={{ marginTop: '1.5rem' }}>
            <div className={styles.statusRow}>
              <span className={styles.badge}>
                Hexagrama {payload.hexagram_number} · {payload.hexagram_name}
              </span>
            </div>

            <div className={styles.messageCard}>
              <h2>{payload.headline || payload.hexagram_name}</h2>
              {payload.interpretation && <p>{payload.interpretation}</p>}
            </div>

            {payload.changing_lines_meaning && (
              <div className={styles.sectionBlock}>
                <h3>Linhas em mutação</h3>
                <p>{payload.changing_lines_meaning}</p>
              </div>
            )}

            {payload.advice && (
              <div className={styles.sectionBlock}>
                <h3>Conselho</h3>
                <p>{payload.advice}</p>
              </div>
            )}

            {Array.isArray(payload.themes) && payload.themes.length > 0 && (
              <div className={styles.sectionBlock}>
                <h3>Temas</h3>
                <div className={styles.chipsRow}>
                  {payload.themes.map((theme) => (
                    <span key={theme} className={styles.themeChip}>{theme}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {Array.isArray(historyQuery.data) && historyQuery.data.length > 0 && (
        <section className={styles.card} style={{ marginTop: '1.5rem' }}>
          <div className={styles.sectionBlock}>
            <h3>Consultas anteriores</h3>
            <div className={styles.historyList}>
              {historyQuery.data.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.historyItem}
                  onClick={() => setSelectedReading(item)}
                >
                  <div>
                    <p className={styles.historyItemTitle}>{item.question}</p>
                    <p className={styles.historyItemMeta}>
                      Hexagrama {item.hexagram_number} · {item.hexagram_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
