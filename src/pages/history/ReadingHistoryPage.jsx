import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import styles from './ReadingHistoryPage.module.css';

const spreadTypeLabels = {
  threeCards: 'Três Cartas',
  celticCross: 'Cruz Celta',
  templeOfAphrodite: 'Templo de Afrodite',
  pathChoice: 'Escolha de Caminho',
  three_card: 'Três Cartas',
  celtic_cross: 'Cruz Celta',
  single: 'Carta única',
  five_card: 'Tarot (5 cartas)',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ReadingHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tarotQuery = useQuery({
    queryKey: ['history', 'tarot', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('readings')
        .select('id, created_at, spread_type, question, main_interpretation')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = tarotQuery.isLoading;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate('/perfil')}>
          ← Perfil
        </button>
        <div>
          <h1>Histórico de Leituras</h1>
          <p>Todas as suas consultas oraculares organizadas por tipo.</p>
        </div>
      </header>

      <div className={styles.content}>
        {isLoading && <p className={styles.empty}>Carregando...</p>}

        {/* TAROT */}
        {!tarotQuery.isLoading && (
          <>
            {tarotQuery.data?.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma leitura de Tarot ainda.</p>
                <Link to="/tarot" className={styles.emptyCta}>Fazer primeira leitura →</Link>
              </div>
            ) : (
              <ul className={styles.list}>
                {tarotQuery.data.map((reading) => (
                  <li key={reading.id} className={styles.item}>
                    <Link to={`/leitura/${reading.id}`} className={styles.itemLink}>
                      <div className={styles.itemMain}>
                        <strong>{spreadTypeLabels[reading.spread_type] || 'Leitura de Tarot'}</strong>
                        {reading.question && (
                          <p className={styles.itemQuestion}>"{reading.question}"</p>
                        )}
                        {reading.main_interpretation && (
                          <p className={styles.itemPreview}>
                            {reading.main_interpretation.slice(0, 120)}...
                          </p>
                        )}
                      </div>
                      <time className={styles.itemDate}>{formatDate(reading.created_at)}</time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

      </div>
    </div>
  );
}
