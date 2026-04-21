import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import styles from './ReadingHistoryPage.module.css';

const extractPreview = (reading) => {
  if (reading.main_interpretation) return reading.main_interpretation.slice(0, 120) + '...';
  const d = reading.interpretation_data;
  if (!d) return null;
  const data = d?.data ?? d;
  const resumo = data?.interpretacao?.resumo || data?.resumo_geral || data?.resumo || data?.summary;
  if (resumo) return resumo.slice(0, 120) + '...';
  const analises = data?.interpretacao?.analise_cartas || data?.analise_cartas;
  if (Array.isArray(analises) && analises[0]?.texto) return analises[0].texto.slice(0, 120) + '...';
  return null;
};

const getQuestionText = (question) => {
  if (!question) return null;
  if (typeof question === 'string') {
    try {
      const parsed = JSON.parse(question);
      if (parsed.name1 && parsed.name2) return `${parsed.name1} & ${parsed.name2}`;
      if (parsed.path1 && parsed.path2) return `${parsed.path1} vs ${parsed.path2}`;
    } catch {
      return question;
    }
  }
  if (typeof question === 'object') {
    if (question.name1 && question.name2) return `${question.name1} & ${question.name2}`;
    if (question.path1 && question.path2) return `${question.path1} vs ${question.path2}`;
  }
  return String(question);
};

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
  const goBack = () => navigate(-1);
  const tarotQuery = useQuery({
    queryKey: ['history', 'tarot', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('readings')
        .select('id, created_at, spread_type, question, main_interpretation, interpretation_data')
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
        <button type="button" className={styles.backButton} onClick={goBack}>
          ← Voltar
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
                    {(() => {
                      const questionText = getQuestionText(reading.question);
                      const preview = extractPreview(reading);
                      return (
                        <Link to={`/leitura/${reading.id}`} className={styles.itemLink}>
                          <div className={styles.itemMain}>
                            <strong>{spreadTypeLabels[reading.spread_type] || 'Leitura de Tarot'}</strong>
                            {questionText && (
                              <p className={styles.itemQuestion}>"{questionText}"</p>
                            )}
                            {preview && (
                              <p className={styles.itemPreview}>{preview}</p>
                            )}
                          </div>
                          <time className={styles.itemDate}>{formatDate(reading.created_at)}</time>
                        </Link>
                      );
                    })()}
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
