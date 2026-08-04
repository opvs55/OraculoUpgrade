import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import { oraclesApi } from '../../services/api/oraclesApi';
import styles from './FeaturePage.module.css';

export default function TransitsPage() {
  const [birthDate, setBirthDate] = useState('');

  const mutation = useMutation({
    mutationFn: () => oraclesApi.getNumerologyTransits({ birthDate }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate) return;
    mutation.mutate();
  };

  const result = mutation.data?.result_payload;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Numerologia</p>
        <h1>Trânsitos</h1>
        <p className={styles.subtitle}>Seu Ano, Mês e Dia Pessoal — a energia numerológica de hoje.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="birthDate">Sua data de nascimento</label>
            <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          </div>
          <button type="submit" className={styles.primaryButton} disabled={mutation.isPending}>
            {mutation.isPending ? 'Calculando...' : 'Ver meus trânsitos'}
          </button>
        </form>

        {mutation.isError && (
          <p className={styles.inlineError}>
            {mutation.error?.message || 'Não foi possível calcular seus trânsitos agora.'}
          </p>
        )}

        {result && (
          <div className={styles.resultCard} style={{ marginTop: '1.5rem' }}>
            <div className={styles.monthGrid}>
              <div className={styles.monthCard}>
                <p className={styles.monthLabel}>Ano Pessoal</p>
                <p className={styles.monthCardName}>{result.personal_year}</p>
              </div>
              <div className={styles.monthCard}>
                <p className={styles.monthLabel}>Mês Pessoal</p>
                <p className={styles.monthCardName}>{result.personal_month}</p>
              </div>
              <div className={styles.monthCard}>
                <p className={styles.monthLabel}>Dia Pessoal</p>
                <p className={styles.monthCardName}>{result.personal_day}</p>
              </div>
            </div>

            {result.year_theme && (
              <div className={styles.sectionBlock}>
                <h3>Tema do Ano Pessoal</h3>
                <p>{result.year_theme}</p>
              </div>
            )}

            {result.narrative && (
              <div className={styles.messageCard}>
                <h2>Orientação para hoje</h2>
                <p>{result.narrative}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
