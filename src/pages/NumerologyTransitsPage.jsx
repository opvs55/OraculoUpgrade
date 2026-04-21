import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import styles from './NumerologyTransitsPage.module.css';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function NumerologyTransitsPage() {
  usePageTitle('Trânsitos Numerológicos');
  const { user } = useAuth();
  const [formError, setFormError] = useState(null);

  const numerologyQuery = useQuery({
    queryKey: ['numerology-base-transit', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('numerology_readings')
        .select('input_birth_date, life_path_number')
        .eq('user_id', user.id)
        .maybeSingle();
      return data || null;
    },
    staleTime: 1000 * 60 * 60,
  });

  const mutation = useMutation({
    mutationFn: (payload) => oraclesApi.getNumerologyTransits(payload),
    onError: (err) => setFormError(err?.message || 'Erro ao calcular trânsitos.'),
  });

  const birthDate = numerologyQuery.data?.input_birth_date;
  const result = mutation.data?.result_payload;

  useEffect(() => {
    if (birthDate && !mutation.isPending && !result) {
      mutation.mutate({ birthDate, transitDate: todayStr() });
    }
  }, [birthDate]);

  const handleCalculate = () => {
    setFormError(null);
    if (!birthDate) return setFormError('Calcule sua numerologia pessoal primeiro.');
    mutation.mutate({ birthDate, transitDate: todayStr() });
  };

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Numerologia</p>
        <h1>Trânsitos do Dia</h1>
        <p className={styles.dateLabel}>{today}</p>
        <p className={styles.subtitle}>Seu Ano, Mês e Dia pessoal — a vibração numérica que você está vivendo agora.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>

        {!user && (
          <div className={styles.guestBox}>
            <p>Esta feature requer uma conta. <Link to="/cadastro" className={styles.inlineLink}>Criar conta gratuitamente</Link></p>
          </div>
        )}

        {user && numerologyQuery.isLoading && <p className={styles.loading}>Carregando...</p>}

        {user && !numerologyQuery.isLoading && !birthDate && (
          <div className={styles.noBaseBox}>
            <p>Você ainda não calculou sua numerologia base.</p>
            <Link to="/numerologia" className={styles.ctaButton}>Calcular agora →</Link>
          </div>
        )}

        {user && birthDate && !result && (
          <div className={styles.calculateBox}>
            {mutation.isPending && <p className={styles.calculateDesc}>Calculando seus trânsitos de hoje…</p>}
            {formError && (
              <>
                <p className={styles.error}>{formError}</p>
                <button className={styles.submitButton} onClick={handleCalculate} type="button">Tentar novamente</button>
              </>
            )}
          </div>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.tripleGrid}>
              <div className={styles.transitCard}>
                <span className={styles.transitNumber}>{result.personal_year}</span>
                <p className={styles.transitLabel}>Ano Pessoal</p>
              </div>
              <div className={styles.transitCard}>
                <span className={styles.transitNumber}>{result.personal_month}</span>
                <p className={styles.transitLabel}>Mês Pessoal</p>
              </div>
              <div className={`${styles.transitCard} ${styles.transitCardDay}`}>
                <span className={styles.transitNumber}>{result.personal_day}</span>
                <p className={styles.transitLabel}>Dia Pessoal</p>
              </div>
            </div>

            {result.year_theme && (
              <div className={styles.themeCard}>
                <p className={styles.cardLabel}>Tema do Ano {result.personal_year}</p>
                <p className={styles.themeText}>{result.year_theme}</p>
              </div>
            )}

            {result.narrative && (
              <div className={styles.narrativeCard}>
                <p className={styles.cardLabel}>Orientação para hoje</p>
                <p className={styles.narrativeText}>{result.narrative}</p>
              </div>
            )}

            <button className={styles.resetButton} onClick={() => mutation.reset()} type="button">
              Recalcular
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
