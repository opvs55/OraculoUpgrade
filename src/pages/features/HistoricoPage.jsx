import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useReadingsHistory } from '../../hooks/useReadings';
import { oraclesApi } from '../../services/api/oraclesApi';
import { formatSpreadType } from '../../utils/formatSpreadType';
import styles from './FeaturePage.module.css';

const TABS = [
  { key: 'tarot', label: 'Tarot' },
  { key: 'sintese', label: 'Síntese Semanal' },
  { key: 'iching', label: 'I Ching Ativo' },
];

function formatDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
}

export default function HistoricoPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tarot');

  const tarotHistory = useReadingsHistory(userId);

  const synthesisHistory = useQuery({
    queryKey: ['historico', 'sintese', userId],
    queryFn: () => oraclesApi.getUnifiedReadings({ limit: 20 }),
    enabled: !!userId && activeTab === 'sintese',
  });

  const ichingHistory = useQuery({
    queryKey: ['historico', 'iching-ativo', userId],
    queryFn: () => oraclesApi.getIchingActiveHistory(20),
    enabled: !!userId && activeTab === 'iching',
  });

  const synthesisItems = Array.isArray(synthesisHistory.data)
    ? synthesisHistory.data
    : synthesisHistory.data?.items || synthesisHistory.data?.data || [];

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Sua jornada</p>
        <h1>Leituras Passadas</h1>
        <p className={styles.subtitle}>Tudo que o oráculo já revelou pra você, num só lugar.</p>
      </header>

      <DecorativeDivider />

      <div className={styles.tabsRow}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className={styles.card}>
        {activeTab === 'tarot' && (
          <>
            {tarotHistory.isLoading && <Loader />}
            {!tarotHistory.isLoading && (tarotHistory.data || []).length === 0 && (
              <div className={styles.emptyState}>
                <p>Você ainda não fez nenhuma leitura de Tarot.</p>
              </div>
            )}
            <div className={styles.historyList}>
              {(tarotHistory.data || []).map((reading) => (
                <button
                  key={reading.id}
                  type="button"
                  className={styles.historyItem}
                  onClick={() => navigate(`/leitura/${reading.id}`)}
                >
                  <div>
                    <p className={styles.historyItemTitle}>{reading.question || 'Leitura de Tarot'}</p>
                    <p className={styles.historyItemMeta}>
                      {formatSpreadType(reading.spread_type)} · {formatDate(reading.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === 'sintese' && (
          <>
            {synthesisHistory.isLoading && <Loader />}
            {!synthesisHistory.isLoading && synthesisItems.length === 0 && (
              <div className={styles.emptyState}>
                <p>Nenhuma Síntese Semanal gerada ainda.</p>
              </div>
            )}
            <div className={styles.historyList}>
              {synthesisItems.map((reading) => (
                <button
                  key={reading.id}
                  type="button"
                  className={styles.historyItem}
                  onClick={() => navigate(`/oraculo/geral/${reading.id}`)}
                >
                  <div>
                    <p className={styles.historyItemTitle}>
                      {reading?.final_reading?.title || reading?.finalReading?.title || 'Síntese Semanal'}
                    </p>
                    <p className={styles.historyItemMeta}>
                      {reading.week_ref || reading.weekRef} · {formatDate(reading.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === 'iching' && (
          <>
            {ichingHistory.isLoading && <Loader />}
            {!ichingHistory.isLoading && (ichingHistory.data || []).length === 0 && (
              <div className={styles.emptyState}>
                <p>Nenhuma consulta ativa de I Ching ainda.</p>
              </div>
            )}
            <div className={styles.historyList}>
              {(ichingHistory.data || []).map((item) => (
                <div key={item.id} className={styles.historyItem} style={{ cursor: 'default' }}>
                  <div>
                    <p className={styles.historyItemTitle}>{item.question}</p>
                    <p className={styles.historyItemMeta}>
                      Hexagrama {item.hexagram_number} · {item.hexagram_name} · {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
