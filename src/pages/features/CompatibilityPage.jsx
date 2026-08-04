import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import { oraclesApi } from '../../services/api/oraclesApi';
import styles from './FeaturePage.module.css';

export default function CompatibilityPage() {
  const [name1, setName1] = useState('');
  const [birthDate1, setBirthDate1] = useState('');
  const [name2, setName2] = useState('');
  const [birthDate2, setBirthDate2] = useState('');

  const mutation = useMutation({
    mutationFn: () => oraclesApi.getNumerologyCompatibility({ name1, birthDate1, name2, birthDate2 }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name1 || !birthDate1 || !name2 || !birthDate2) return;
    mutation.mutate();
  };

  const result = mutation.data?.result_payload;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Numerologia</p>
        <h1>Compatibilidade</h1>
        <p className={styles.subtitle}>Compare dois Caminhos de Vida e veja onde a energia do par se encontra.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label htmlFor="name1">Seu nome</label>
              <input id="name1" type="text" value={name1} onChange={(e) => setName1(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="birthDate1">Sua data de nascimento</label>
              <input id="birthDate1" type="date" value={birthDate1} onChange={(e) => setBirthDate1(e.target.value)} required />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label htmlFor="name2">Nome da outra pessoa</label>
              <input id="name2" type="text" value={name2} onChange={(e) => setName2(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="birthDate2">Data de nascimento dela</label>
              <input id="birthDate2" type="date" value={birthDate2} onChange={(e) => setBirthDate2(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className={styles.primaryButton} disabled={mutation.isPending}>
            {mutation.isPending ? 'Calculando...' : 'Ver compatibilidade'}
          </button>
        </form>

        {mutation.isError && (
          <p className={styles.inlineError}>
            {mutation.error?.message || 'Não foi possível calcular a compatibilidade agora.'}
          </p>
        )}

        {result && (
          <div className={styles.resultCard} style={{ marginTop: '1.5rem' }}>
            <div className={styles.scoreRow}>
              <div className={styles.scoreCircle}>
                <strong>{result.score}</strong>
                <span>/100</span>
              </div>
              <div className={styles.messageCard} style={{ flex: 1 }}>
                <h2>{result.headline}</h2>
              </div>
            </div>

            {result.harmony && (
              <div className={styles.sectionBlock}>
                <h3>Harmonia</h3>
                <p>{result.harmony}</p>
              </div>
            )}

            {result.tension && (
              <div className={styles.sectionBlock}>
                <h3>Pontos de atrito</h3>
                <p>{result.tension}</p>
              </div>
            )}

            {Array.isArray(result.aspects) && result.aspects.length > 0 && (
              <div className={styles.sectionBlock}>
                <h3>Aspectos</h3>
                <div className={styles.chipsRow}>
                  {result.aspects.map((aspect) => (
                    <span key={aspect} className={styles.themeChip}>{aspect}</span>
                  ))}
                </div>
              </div>
            )}

            {result.advice && (
              <div className={styles.sectionBlock}>
                <h3>Conselho</h3>
                <p>{result.advice}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
