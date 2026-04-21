import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import styles from './ReadingHistoryPage.module.css';

const TABS = [
  { id: 'tarot', label: 'Tarot' },
  { id: 'runes', label: 'Runas' },
  { id: 'iching', label: 'I Ching' },
  { id: 'numerology', label: 'Numerologia' },
  { id: 'synthesis', label: 'Síntese Geral' },
];

const spreadTypeLabels = {
  three_card: 'Tarot (3 cartas)',
  celtic_cross: 'Cruz Celta',
  single: 'Carta única',
  five_card: 'Tarot (5 cartas)',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const unwrap = (obj, depth = 0) => {
  if (!obj || depth > 8) return obj;
  if (obj?.narrative || obj?.themes || obj?.life_path_number) return obj;
  if (obj?.result_payload) return unwrap(obj.result_payload, depth + 1);
  return obj;
};

export default function ReadingHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tarot');

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

  const oracleQuery = useQuery({
    queryKey: ['history', 'oracles', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oracle_weekly_modules')
        .select('id, oracle_type, week_start, output_payload, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'ok')
        .order('created_at', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data || [];
    },
  });

  const numerologyQuery = useQuery({
    queryKey: ['history', 'numerology', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('numerology_weekly_readings')
        .select('id, week_start, week_ref, result_payload, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const synthesisQuery = useQuery({
    queryKey: ['history', 'synthesis', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_readings')
        .select('id, week_ref, week_start, final_reading, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const runesList = (oracleQuery.data || []).filter((m) => m.oracle_type === 'runes_weekly');
  const ichingList = (oracleQuery.data || []).filter((m) => m.oracle_type === 'iching_weekly');

  const isLoading =
    (activeTab === 'tarot' && tarotQuery.isLoading) ||
    (['runes', 'iching'].includes(activeTab) && oracleQuery.isLoading) ||
    (activeTab === 'numerology' && numerologyQuery.isLoading) ||
    (activeTab === 'synthesis' && synthesisQuery.isLoading);

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

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {isLoading && <p className={styles.empty}>Carregando...</p>}

        {/* TAROT */}
        {activeTab === 'tarot' && !tarotQuery.isLoading && (
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

        {/* RUNAS */}
        {activeTab === 'runes' && !oracleQuery.isLoading && (
          <>
            {runesList.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma tiragem de Runas ainda.</p>
                <Link to="/runas" className={styles.emptyCta}>Gerar runas semanais →</Link>
              </div>
            ) : (
              <ul className={styles.list}>
                {runesList.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <div className={styles.itemMain}>
                      <strong>Runas Semanais</strong>
                      {item.output_payload?.theme && (
                        <p className={styles.itemQuestion}>{item.output_payload.theme}</p>
                      )}
                      {item.output_payload?.runes && (
                        <p className={styles.itemRunes}>
                          {(Array.isArray(item.output_payload.runes) ? item.output_payload.runes : [])
                            .slice(0, 3)
                            .map((r) => r?.symbol || r?.key || r?.name || '?')
                            .join('  ·  ')}
                        </p>
                      )}
                    </div>
                    <time className={styles.itemDate}>{formatDate(item.week_start)}</time>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* I CHING */}
        {activeTab === 'iching' && !oracleQuery.isLoading && (
          <>
            {ichingList.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma consulta ao I Ching ainda.</p>
                <Link to="/iching" className={styles.emptyCta}>Consultar I Ching →</Link>
              </div>
            ) : (
              <ul className={styles.list}>
                {ichingList.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <div className={styles.itemMain}>
                      <strong>
                        {item.output_payload?.hexagram_name
                          ? `Hexagrama ${item.output_payload.hexagram_number} — ${item.output_payload.hexagram_name}`
                          : 'I Ching Semanal'}
                      </strong>
                      {item.output_payload?.theme && (
                        <p className={styles.itemQuestion}>{item.output_payload.theme}</p>
                      )}
                    </div>
                    <time className={styles.itemDate}>{formatDate(item.week_start)}</time>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* NUMEROLOGIA */}
        {activeTab === 'numerology' && !numerologyQuery.isLoading && (
          <>
            {numerologyQuery.data?.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma leitura de Numerologia ainda.</p>
                <Link to="/numerologia" className={styles.emptyCta}>Gerar numerologia →</Link>
              </div>
            ) : (
              <ul className={styles.list}>
                {numerologyQuery.data.map((item) => {
                  const payload = unwrap(item.result_payload);
                  return (
                    <li key={item.id} className={styles.item}>
                      <div className={styles.itemMain}>
                        <strong>Numerologia Semanal — {item.week_ref || item.week_start}</strong>
                        {payload?.personal_week_vibe && (
                          <p className={styles.itemQuestion}>Vibração {payload.personal_week_vibe} · Caminho {payload.life_path_number}</p>
                        )}
                        {payload?.narrative && (
                          <p className={styles.itemPreview}>{payload.narrative.slice(0, 120)}...</p>
                        )}
                      </div>
                      <time className={styles.itemDate}>{formatDate(item.created_at)}</time>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* SÍNTESE GERAL */}
        {activeTab === 'synthesis' && !synthesisQuery.isLoading && (
          <>
            {synthesisQuery.data?.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhuma síntese integrada ainda.</p>
                <Link to="/oraculo/geral" className={styles.emptyCta}>Gerar síntese →</Link>
              </div>
            ) : (
              <ul className={styles.list}>
                {synthesisQuery.data.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <Link to={`/oraculo/geral/${item.id}`} className={styles.itemLink}>
                      <div className={styles.itemMain}>
                        <strong>{item.final_reading?.title || `Síntese ${item.week_ref}`}</strong>
                        {item.final_reading?.one_liner && (
                          <p className={styles.itemQuestion}>{item.final_reading.one_liner}</p>
                        )}
                        {item.status === 'partial' && (
                          <span className={styles.partialBadge}>Parcial</span>
                        )}
                      </div>
                      <time className={styles.itemDate}>{formatDate(item.created_at)}</time>
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
