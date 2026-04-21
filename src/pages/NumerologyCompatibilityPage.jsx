import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import styles from './NumerologyCompatibilityPage.module.css';

export default function NumerologyCompatibilityPage() {
  usePageTitle('Compatibilidade Numerológica');
  const { user } = useAuth();
  const [form, setForm] = useState({ name1: '', birthDate1: '', name2: '', birthDate2: '' });
  const [formError, setFormError] = useState(null);

  const mutation = useMutation({
    mutationFn: (payload) => oraclesApi.getNumerologyCompatibility(payload),
    onError: (err) => setFormError(err?.message || 'Erro ao calcular compatibilidade.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    const { name1, birthDate1, name2, birthDate2 } = form;
    if (!name1.trim() || !name2.trim()) return setFormError('Preencha os dois nomes.');
    if (!birthDate1 || !birthDate2) return setFormError('Preencha as duas datas de nascimento.');
    mutation.mutate({ name1: name1.trim(), birthDate1, name2: name2.trim(), birthDate2 });
  };

  const result = mutation.data?.result_payload;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Numerologia</p>
        <h1>Compatibilidade</h1>
        <p className={styles.subtitle}>Descubra a dinâmica numerológica entre duas pessoas.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {!user && (
          <div className={styles.guestBox}>
            <p className={styles.guestTitle}>Compatibilidade Numerológica</p>
            <p className={styles.guestDesc}>Esta feature requer uma conta. <Link to="/cadastro" className={styles.inlineLink}>Criar conta gratuitamente</Link></p>
          </div>
        )}

        {user && !result && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.personGroup}>
              <p className={styles.personLabel}>Você</p>
              <input className={styles.input} type="text" placeholder="Seu nome" value={form.name1} onChange={e => setForm(f => ({ ...f, name1: e.target.value }))} />
              <input className={styles.input} type="date" value={form.birthDate1} min="1900-01-01" max={`${new Date().getFullYear()}-12-31`} onChange={e => setForm(f => ({ ...f, birthDate1: e.target.value }))} />
            </div>
            <div className={styles.andDivider}>✦</div>
            <div className={styles.personGroup}>
              <p className={styles.personLabel}>A outra pessoa</p>
              <input className={styles.input} type="text" placeholder="Nome da outra pessoa" value={form.name2} onChange={e => setForm(f => ({ ...f, name2: e.target.value }))} />
              <input className={styles.input} type="date" value={form.birthDate2} min="1900-01-01" max={`${new Date().getFullYear()}-12-31`} onChange={e => setForm(f => ({ ...f, birthDate2: e.target.value }))} />
            </div>
            {formError && <p className={styles.error}>{formError}</p>}
            <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
              {mutation.isPending ? 'Analisando...' : 'Calcular compatibilidade'}
            </button>
          </form>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.scoreSection}>
              <div className={styles.scoreOrb}>{result.score}<span className={styles.scoreUnit}>%</span></div>
              <div className={styles.scoreInfo}>
                <h2 className={styles.scoreHeadline}>{result.headline}</h2>
                <div className={styles.pathPills}>
                  <span className={styles.pathPill}>Caminho de Vida {result.lp1} — {result.name1}</span>
                  <span className={styles.pathPill}>Caminho de Vida {result.lp2} — {result.name2}</span>
                </div>
              </div>
            </div>

            {result.harmony && (
              <div className={styles.resultCard}>
                <p className={styles.cardLabel}>O que funciona bem</p>
                <p className={styles.cardText}>{result.harmony}</p>
              </div>
            )}
            {result.tension && (
              <div className={styles.resultCard}>
                <p className={styles.cardLabel}>Pontos de atenção</p>
                <p className={styles.cardText}>{result.tension}</p>
              </div>
            )}
            {result.advice && (
              <div className={styles.resultCard}>
                <p className={styles.cardLabel}>Conselho</p>
                <p className={styles.cardText}>{result.advice}</p>
              </div>
            )}
            {result.aspects?.length > 0 && (
              <div className={styles.aspects}>
                {result.aspects.map((a, i) => <span key={i} className={styles.aspectPill}>{a}</span>)}
              </div>
            )}

            <button className={styles.resetButton} onClick={() => mutation.reset()} type="button">
              Calcular outra compatibilidade
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
