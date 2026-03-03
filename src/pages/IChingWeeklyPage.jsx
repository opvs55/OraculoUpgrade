import React, { useState } from 'react';
import { oraclesApi } from '../services/api/oraclesApi';
import styles from './IChingWeeklyPage.module.css';

export default function IChingWeeklyPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await oraclesApi.generateIChingWeekly({});
      setResult(response);
    } catch (err) {
      setError(err?.message || 'Não foi possível gerar I Ching da Semana.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <section className={styles.card}>
        <h1>I Ching Semanal</h1>
        <p>Gere sua leitura semanal para completar os requisitos do Oráculo Geral.</p>
        <button type="button" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Gerando...' : 'Gerar I Ching da Semana'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {result && <pre className={styles.result}>{JSON.stringify(result, null, 2)}</pre>}
      </section>
    </div>
  );
}
