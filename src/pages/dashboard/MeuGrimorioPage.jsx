import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useGrimorioReadings } from '../../hooks/useGrimorioReadings';
import { useWeeklyCard } from '../../hooks/useWeeklyCard';
import { useGrimorioInsights, useDerivedGrimorioInsights } from '../../hooks/useGrimorioInsights';
import { resolveRune } from '../../constants/runes';
import HexagramDisplay from '../../components/iching/HexagramDisplay';
import { oraclesApi } from '../../services/api/oraclesApi';
import GrimorioToolbar from './Grimorio/GrimorioToolbar';
import WeeklyCardRitual from './Grimorio/WeeklyCardRitual';
import ReadingHistoryList from './Grimorio/ReadingHistoryList';
import InsightsPanel from './Grimorio/InsightsPanel';
import styles from './MeuGrimorioPage.module.css'; 

const normalizeWeeklyData = (payload) => {
  const root = payload ?? {};
  const source = root?.data?.data ?? root?.data ?? root;
  const module = source?.module ?? null;

  return {
    status: source?.status ?? module?.status ?? null,
    weekRef: source?.week_ref ?? module?.week_ref ?? null,
    module,
    outputPayload: module?.output_payload ?? module?.outputPayload ?? {},
  };
};

const getOracleHeadline = (outputPayload) => outputPayload?.headline || outputPayload?.summary || 'Leitura semanal disponível.';

function MeuGrimorioPage() { 
  const [videoAtualIndex, setVideoAtualIndex] = useState(() => Math.floor(Math.random() * 2));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [spreadType, setSpreadType] = useState('');
  const [period, setPeriod] = useState('30d');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [privacy, setPrivacy] = useState('');
  const [withComments, setWithComments] = useState(false);
  const [withStars, setWithStars] = useState(false);
  const [cardFilter, setCardFilter] = useState('');

  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const {
    weekStart,
    cardDetails,
    revealAllowed,
    revealCard,
    isRevealing,
    isSessionLoading,
    errorMessage,
  } = useWeeklyCard(user?.id);
  const { data: insightsReadings, isLoading: isInsightsLoading } = useGrimorioInsights(user?.id);
  const derivedInsights = useDerivedGrimorioInsights(insightsReadings);

  const runesWeeklyQuery = useQuery({
    queryKey: ['oracles', 'runes', 'weekly', 'me', user?.id],
    queryFn: () => oraclesApi.getMyRunesWeekly(),
    enabled: !!user?.id,
  });

  const ichingWeeklyQuery = useQuery({
    queryKey: ['oracles', 'iching', 'weekly', 'me', user?.id],
    queryFn: () => oraclesApi.getMyIChingWeekly(),
    enabled: !!user?.id,
  });

  const handleVideoEnd = () => setVideoAtualIndex(prev => (prev + 1) % 2);
  const { periodStart, periodEnd } = useMemo(() => {
    if (period === 'all') {
      return { periodStart: null, periodEnd: null };
    }
    if (period === 'custom') {
      return {
        periodStart: customRange.start ? new Date(customRange.start).toISOString() : null,
        periodEnd: customRange.end ? new Date(`${customRange.end}T23:59:59`).toISOString() : null,
      };
    }
    const now = new Date();
    const start = new Date();
    if (period === '7d') start.setDate(now.getDate() - 7);
    if (period === '30d') start.setDate(now.getDate() - 30);
    if (period === '90d') start.setDate(now.getDate() - 90);
    return {
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
    };
  }, [period, customRange]);

  const {
    readings,
    isLoading,
    isError,
    refetch: refetchHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    queryKey,
    totalCount,
  } = useGrimorioReadings({
    userId: user?.id,
    searchTerm: debouncedSearch,
    spreadType,
    periodStart,
    periodEnd,
    privacy,
    withComments,
    withStars,
    cardFilter,
  });

  const runesWeekly = useMemo(() => normalizeWeeklyData(runesWeeklyQuery.data), [runesWeeklyQuery.data]);
  const ichingWeekly = useMemo(() => normalizeWeeklyData(ichingWeeklyQuery.data), [ichingWeeklyQuery.data]);

  const runesOutput = runesWeekly.outputPayload;
  const ichingOutput = ichingWeekly.outputPayload;
  const runeSymbols = (Array.isArray(runesOutput?.runes) ? runesOutput.runes : [])
    .slice(0, 3)
    .map((rune) => resolveRune(rune?.key || rune?.name || rune?.symbol || rune).symbol);
  const ichingLines = Array.isArray(ichingOutput?.lines) ? ichingOutput.lines : [];
  const hasRunesWeekly = runesWeekly.status === 'ok' && runesWeekly.module;
  const hasIChingWeekly = ichingWeekly.status === 'ok' && ichingWeekly.module;

  return (
    <div className={styles.painelContainer}>
      <video
        key={videoAtualIndex} autoPlay muted playsInline onEnded={handleVideoEnd}
        className={styles.videoFundo}
      >
        <source src={`/assets/v${videoAtualIndex + 1}.mp4`} type="video/mp4" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
      <div className={styles.videoOverlay}></div>

      <div className={styles.conteudoSobreposto}>
        <div className={styles.grimorioLayout}>
          <div className={styles.mainColumn}>
            <WeeklyCardRitual
              cardDetails={cardDetails}
              revealAllowed={revealAllowed}
              onReveal={revealCard}
              isRevealing={isRevealing}
              isSessionLoading={isSessionLoading}
              errorMessage={errorMessage}
              onFilterByCard={() => navigate('/biblioteca')}
              onRelateRecent={() => navigate('/oraculo/geral', { state: { source: 'weekly-card' } })}
            />

            <section className={styles.oraclesSummarySection}>
              <article className={styles.oracleMiniCard}>
                <h2 className={styles.oracleMiniTitle}>Runas da Semana</h2>
                {hasRunesWeekly ? (
                  <>
                    <span className={styles.oracleBadge}>Semanal • {runesWeekly.weekRef || 'Semana atual'}</span>
                    <div className={styles.runesMiniVisual}>
                      {runeSymbols.map((symbol, index) => (
                        <span key={`${symbol}-${index}`} className={styles.runeMiniStone}>{symbol}</span>
                      ))}
                    </div>
                    <p className={styles.oracleHeadline}>{getOracleHeadline(runesOutput)}</p>
                    <Link to="/runas" className={styles.oracleLink}>Abrir</Link>
                  </>
                ) : (
                  <>
                    <p className={styles.oracleEmpty}>Seu módulo semanal de Runas ainda não foi gerado.</p>
                    <Link to="/runas" className={styles.oracleLinkPrimary}>Gerar agora</Link>
                  </>
                )}
              </article>

              <article className={styles.oracleMiniCard}>
                <h2 className={styles.oracleMiniTitle}>I Ching da Semana</h2>
                {hasIChingWeekly ? (
                  <>
                    <span className={styles.oracleBadge}>Semanal • {ichingWeekly.weekRef || 'Semana atual'}</span>
                    {ichingLines.length === 6 && (
                      <div className={styles.hexagramMiniWrap}>
                        <HexagramDisplay lines={ichingLines} />
                      </div>
                    )}
                    <p className={styles.oracleHeadline}>{getOracleHeadline(ichingOutput)}</p>
                    <Link to="/iching" className={styles.oracleLink}>Abrir</Link>
                  </>
                ) : (
                  <>
                    <p className={styles.oracleEmpty}>Seu módulo semanal de I Ching ainda não foi gerado.</p>
                    <Link to="/iching" className={styles.oracleLinkPrimary}>Gerar agora</Link>
                  </>
                )}
              </article>
            </section>

            <section className={styles.historySection}>
              <GrimorioToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                spreadType={spreadType}
                onSpreadTypeChange={setSpreadType}
                period={period}
                onPeriodChange={setPeriod}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
                privacy={privacy}
                onPrivacyChange={setPrivacy}
                withComments={withComments}
                onWithCommentsChange={setWithComments}
                withStars={withStars}
                onWithStarsChange={setWithStars}
                totalCount={totalCount}
              />
              {cardFilter && (
                <div className={styles.activeFilter}>
                  <span>Filtrando por carta: {cardFilter}</span>
                  <button type="button" onClick={() => setCardFilter('')}>
                    Limpar filtro
                  </button>
                </div>
              )}
              <ReadingHistoryList
                readings={readings}
                isLoading={isLoading}
                isError={isError}
                onRetry={refetchHistory}
                onLoadMore={fetchNextPage}
                hasNextPage={hasNextPage}
                isLoadingMore={isFetchingNextPage}
                userId={user?.id}
                queryKey={queryKey}
              />
            </section>

            <div className={styles.insightsMobile}>
              <InsightsPanel insights={derivedInsights} isLoading={isInsightsLoading} variant="accordion" />
            </div>
          </div>

          <div className={styles.insightsColumn}>
            <InsightsPanel insights={derivedInsights} isLoading={isInsightsLoading} />
            <div className={styles.insightsFootnote}>
              Semana iniciada em {weekStart}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeuGrimorioPage;
