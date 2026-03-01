import React, { useState } from 'react';
import { oraclesApi } from '../../services/api/oraclesApi';
import styles from './RunesPage.module.css';

export default function RunesPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await oraclesApi.generateRunesWeekly({});
      setResult(response);
    } catch (err) {
      setError(err?.message || 'Não foi possível gerar leitura semanal de runas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <section className={styles.card}>
        <h1>Runas Semanais</h1>
        <p>Gere sua leitura semanal de runas para liberar a Leitura Geral.</p>
        <button type="button" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Gerando...' : 'Gerar Runas da Semana'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {result && <pre className={styles.result}>{JSON.stringify(result, null, 2)}</pre>}
      </section>
    </div>
  );
}
