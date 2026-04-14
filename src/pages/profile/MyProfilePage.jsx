import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useWeeklyCard } from '../../hooks/useWeeklyCard';
import { resolveRune } from '../../constants/runes';
import { supabase } from '../../supabaseClient';
import Loader from '../../components/common/Loader/Loader';
import { useReelsLab } from '../../features/reels/useReelsLab';
import styles from './MyProfilePage.module.css';

const spreadTypeLabels = {
  oneCard: 'Tarot (1 carta)',
  threeCards: 'Tarot (3 cartas)',
  celticCross: 'Tarot (Cruz Celta)',
  templeOfAphrodite: 'Tarot (Templo de Afrodite)',
  pathChoice: 'Tarot (Escolha de Caminho)',
};

const formatDate = (value) => {
  if (!value) return 'Sem data';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const getCardImageUrl = (image) =>
  image ? `${import.meta.env.BASE_URL}${image.startsWith('/') ? image.slice(1) : image}` : null;

const getOracleHeadline = (payload) =>
  payload?.headline || payload?.summary || payload?.one_liner || payload?.weekly_focus || 'Leitura disponível.';

function useUnifiedOracleHub(userId) {
  return useQuery({
    queryKey: ['unifiedOracleHub', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      const safeQuery = async (query, fallback = []) => {
        const { data, error } = await query;
        if (error) {
          console.warn('Falha ao buscar bloco do painel unificado:', error.message);
          return fallback;
        }
        return data ?? fallback;
      };

      const [readings, weeklyCardRows, unifiedRows, runesRows, ichingRows, numerologyRows, numerologyWeeklyRows] = await Promise.all([
        safeQuery(
          supabase
            .from('readings')
            .select('id, created_at, spread_type')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(6),
        ),
        safeQuery(
          supabase
            .from('weekly_cards')
            .select('id, card_name, week_start, created_at')
            .eq('user_id', userId)
            .order('week_start', { ascending: false })
            .limit(1),
        ),
        safeQuery(
          supabase
            .from('unified_readings')
            .select('id, week_ref, created_at, final_reading')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1),
        ),
        safeQuery(
          supabase
            .from('oracle_weekly_modules')
            .select('id, output_payload, week_start, updated_at')
            .eq('user_id', userId)
            .eq('oracle_type', 'runes_weekly')
            .eq('status', 'ok')
            .order('updated_at', { ascending: false })
            .limit(1),
        ),
        safeQuery(
          supabase
            .from('oracle_weekly_modules')
            .select('id, output_payload, week_start, updated_at')
            .eq('user_id', userId)
            .eq('oracle_type', 'iching_weekly')
            .eq('status', 'ok')
            .order('updated_at', { ascending: false })
            .limit(1),
        ),
        safeQuery(
          supabase
            .from('numerology_readings')
            .select('id, life_path_number, birthday_number, input_birth_date, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1),
        ),
        safeQuery(
          supabase
            .from('numerology_weekly_readings')
            .select('id, week_start, week_ref, result_payload, created_at')
            .eq('user_id', userId)
            .order('week_start', { ascending: false })
            .limit(1),
        ),
      ]);

      return {
        recentReadings: readings,
        latestWeeklyCard: weeklyCardRows[0] || null,
        latestSynthesis: unifiedRows[0] || null,
        latestRunes: runesRows[0] || null,
        latestIChing: ichingRows[0] || null,
        latestNumerology: numerologyRows[0] || null,
        latestNumerologyWeekly: numerologyWeeklyRows[0] || null,
      };
    },
  });
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [focusMode, setFocusMode] = useState('tarot');
  const { profile, isLoading: isProfileLoading } = useUserProfile(user?.id);
  const { data: hubData, isLoading: isHubLoading } = useUnifiedOracleHub(user?.id);
  const reelsLab = useReelsLab(user?.id);
  const {
    cardDetails,
    revealAllowed,
    revealCard,
    isRevealing,
    isSessionLoading,
    errorMessage,
  } = useWeeklyCard(user?.id);

  const latestSynthesis = hubData?.latestSynthesis;
  const readings = hubData?.recentReadings || [];
  const reelOfDay = reelsLab.reelOfDay || null;
  const runesPayload = hubData?.latestRunes?.output_payload;
  const ichingPayload = hubData?.latestIChing?.output_payload;
  const weeklyNumerologyPayload = hubData?.latestNumerologyWeekly?.result_payload;
  const numerologyPersonal = hubData?.latestNumerology;
  const cardImageUrl = getCardImageUrl(cardDetails?.img);

  const runeSymbols = useMemo(
    () => (Array.isArray(runesPayload?.runes) ? runesPayload.runes : [])
      .slice(0, 3)
      .map((rune) => resolveRune(rune?.key || rune?.name || rune?.symbol || rune).symbol),
    [runesPayload],
  );

  const weeklySummary = useMemo(() => {
    const tarotReady = Boolean(cardDetails || hubData?.latestWeeklyCard || latestSynthesis);
    const runesReady = Boolean(hubData?.latestRunes);
    const ichingReady = Boolean(hubData?.latestIChing);
    const numerologyReady = Boolean(numerologyPersonal && hubData?.latestNumerologyWeekly);

    const checklist = [
      { id: 'tarot', label: 'Tarot', ready: tarotReady, cta: '/tarot' },
      { id: 'runes', label: 'Runas', ready: runesReady, cta: '/runas' },
      { id: 'iching', label: 'I Ching', ready: ichingReady, cta: '/iching' },
      { id: 'numerology', label: 'Numerologia', ready: numerologyReady, cta: '/numerologia' },
    ];

    const completed = checklist.filter((item) => item.ready).length;
    const total = checklist.length;
    const percent = Math.round((completed / total) * 100);

    return { checklist, completed, total, percent };
  }, [
    cardDetails,
    hubData?.latestWeeklyCard,
    latestSynthesis,
    hubData?.latestRunes,
    hubData?.latestIChing,
    numerologyPersonal,
    hubData?.latestNumerologyWeekly,
  ]);

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    navigate('/tarot');
  };

  if (isProfileLoading || isHubLoading) {
    return (
      <div className={`content_wrapper ${styles.page}`}>
        <Loader customText="Montando seu painel oracular..." />
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || 'https://i.imgur.com/6VBx3io.png';

  const weeklySummary = useMemo(() => {
    const tarotReady = Boolean(cardDetails || hubData?.latestWeeklyCard || latestSynthesis);
    const runesReady = Boolean(hubData?.latestRunes);
    const ichingReady = Boolean(hubData?.latestIChing);
    const numerologyReady = Boolean(numerologyPersonal && hubData?.latestNumerologyWeekly);

    const checklist = [
      { id: 'tarot', label: 'Tarot', ready: tarotReady, cta: '/tarot' },
      { id: 'runes', label: 'Runas', ready: runesReady, cta: '/runas' },
      { id: 'iching', label: 'I Ching', ready: ichingReady, cta: '/iching' },
      { id: 'numerology', label: 'Numerologia', ready: numerologyReady, cta: '/numerologia' },
    ];

    const completed = checklist.filter((item) => item.ready).length;
    const total = checklist.length;
    const percent = Math.round((completed / total) * 100);

    return { checklist, completed, total, percent };
  }, [
    cardDetails,
    hubData?.latestWeeklyCard,
    latestSynthesis,
    hubData?.latestRunes,
    hubData?.latestIChing,
    numerologyPersonal,
    hubData?.latestNumerologyWeekly,
  ]);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <button type="button" className={styles.backButton} onClick={handleBack}>
            ← Voltar
          </button>
          <div className={styles.topActions}>
            <Link to="/perfil/editar" className={styles.secondaryButton}>Editar perfil</Link>
            <Link to="/reels" className={styles.secondaryButton}>Reels</Link>
          </div>
        </header>

        <section className={styles.hero}>
          <img src={avatarUrl} alt={`Avatar de ${profile?.username || 'usuário'}`} className={styles.avatar} />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Seu Espaço Oracular</p>
            <h1>{profile?.full_name || profile?.username || 'Painel pessoal'}</h1>
            <p className={styles.username}>@{profile?.username || 'usuario'}</p>
            {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
            <div className={styles.heroMeta}>
              <span>{readings.length} leituras recentes</span>
              <span>Caminho de Vida: {numerologyPersonal?.life_path_number || profile?.life_path_number || '-'}</span>
              <span>Nascimento: {numerologyPersonal?.birthday_number || profile?.birthday_number || '-'}</span>
            </div>
            <div className={styles.heroActions}>
              <Link to="/tarot" className={styles.primaryButton}>Fazer leitura</Link>
              <Link to="/biblioteca" className={styles.secondaryButton}>Biblioteca Tarot</Link>
              <Link to="/biblioteca/oraculos" className={styles.secondaryButton}>Biblioteca Oráculos</Link>
              {profile?.username && <Link to={`/perfil/${profile.username}`} className={styles.secondaryButton}>Perfil público</Link>}
            </div>
          </div>
        </section>

        {reelOfDay && (
          <section className={styles.reelSpotlight}>
            <div>
              <p className={styles.reelEyebrow}>Reel do dia</p>
              <h2>{reelOfDay.title}</h2>
              <p>{reelOfDay.hook || 'Resumo rápido dos sinais mais vivos do seu momento.'}</p>
            </div>
            <Link to={reelOfDay.ctaTo || '/reels'} className={styles.inlineLink}>Abrir reel</Link>
          </section>
        )}

        <section className={styles.weeklySummarySection}>
          <header className={styles.weeklySummaryHeader}>
            <div>
              <p className={styles.weeklySummaryEyebrow}>Resumo da semana</p>
              <h2>Completude oracular</h2>
            </div>
            <strong className={styles.weeklySummaryScore}>
              {weeklySummary.completed}/{weeklySummary.total}
            </strong>
          </header>
          <div
            className={styles.weeklyProgressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={weeklySummary.percent}
            aria-label={`Completude semanal de ${weeklySummary.percent}%`}
          >
            <span className={styles.weeklyProgressFill} style={{ width: `${weeklySummary.percent}%` }} />
          </div>
          <div className={styles.weeklySummaryChecklist}>
            {weeklySummary.checklist.map((item) => (
              <article
                key={item.id}
                className={`${styles.summaryPill} ${item.ready ? styles.summaryPillReady : styles.summaryPillPending}`}
              >
                <div>
                  <p>{item.label}</p>
                  <span>{item.ready ? 'Ativo' : 'Pendente'}</span>
                </div>
                <Link to={item.cta}>{item.ready ? 'Ver' : 'Gerar'}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.focusTabs} aria-label="Modo foco do painel">
          <button
            type="button"
            className={focusMode === 'tarot' ? styles.focusTabActive : styles.focusTab}
            onClick={() => setFocusMode('tarot')}
          >
            Foco Tarot
          </button>
          <button
            type="button"
            className={focusMode === 'oracles' ? styles.focusTabActive : styles.focusTab}
            onClick={() => setFocusMode('oracles')}
          >
            Foco Outros Oráculos
          </button>
        </section>

        <section className={styles.experienceGrid}>
          <article className={`${styles.tarotZone} ${focusMode === 'tarot' ? styles.zoneVisible : styles.zoneMuted}`}>
            <header className={styles.zoneHeader}>
              <p className={styles.zoneEyebrow}>Pilar 01</p>
              <h2>Tarot</h2>
              <p>Seu núcleo de leitura: carta da semana, histórico recente e síntese integrada.</p>
            </header>

            <div className={styles.tarotHeroCard}>
              <div className={styles.tarotCardVisual}>
                {cardDetails ? (
                  cardImageUrl ? <img src={cardImageUrl} alt={cardDetails.nome} /> : <div className={styles.tarotCardPlaceholder} />
                ) : (
                  <div className={styles.tarotCardBack}>✶</div>
                )}
              </div>
              <div className={styles.tarotHeroContent}>
                <h3>{cardDetails?.nome || hubData?.latestWeeklyCard?.card_name || 'Carta da semana ainda não revelada'}</h3>
                <p>
                  {cardDetails?.significados?.direito
                    ? cardDetails.significados.direito.split('. ')[0]
                    : 'Revele sua carta semanal para abrir o foco principal do seu ciclo.'}
                </p>
                {!cardDetails && (
                  <button
                    type="button"
                    className={styles.revealButton}
                    onClick={() => revealCard()}
                    disabled={!revealAllowed || isRevealing || isSessionLoading}
                  >
                    {isSessionLoading ? 'Carregando sessão...' : isRevealing ? 'Revelando...' : 'Revelar carta da semana'}
                  </button>
                )}
                {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
                <div className={styles.tarotLinks}>
                  <Link to="/tarot">Abrir Tarot</Link>
                  <Link to="/oraculo/geral">Síntese semanal</Link>
                  <Link to="/biblioteca">Entender cartas</Link>
                </div>
              </div>
            </div>

            <div className={styles.timelineCard}>
              <div className={styles.sectionTitleRow}>
                <h3>Timeline Tarot</h3>
                <span>{readings.length} registros</span>
              </div>
              {readings.length > 0 ? (
                <ul className={styles.timelineList}>
                  {readings.map((reading) => (
                    <li key={reading.id}>
                      <strong>{spreadTypeLabels[reading.spread_type] || 'Leitura de Tarot'}</strong>
                      <span>{formatDate(reading.created_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`${styles.emptyState} ${styles.emptyStateAnimated}`}>
                  Suas próximas leituras de Tarot aparecerão aqui.
                </p>
              )}
            </div>
          </article>

          <article className={`${styles.oraclesZone} ${focusMode === 'oracles' ? styles.zoneVisible : styles.zoneMuted}`}>
            <header className={styles.zoneHeader}>
              <p className={styles.zoneEyebrow}>Pilar 02</p>
              <h2>Outros Oráculos</h2>
              <p>Runas, I Ching, Numerologia e Síntese em visão de controle para decisões rápidas.</p>
            </header>

            <div className={styles.oracleCardsGrid}>
              <article className={styles.oracleCard}>
                <h3>Runas</h3>
                {hubData?.latestRunes ? (
                  <>
                    <div className={styles.runeStrip}>
                      {runeSymbols.map((symbol, index) => (
                        <span key={`${symbol}-${index}`}>{symbol}</span>
                      ))}
                    </div>
                    <p>{getOracleHeadline(runesPayload)}</p>
                    <small>{formatDate(hubData.latestRunes.updated_at || hubData.latestRunes.week_start)}</small>
                  </>
                ) : (
                  <p className={`${styles.emptyState} ${styles.emptyStateAnimated}`}>
                    Sem módulo semanal de runas ainda.
                  </p>
                )}
                <Link to="/runas">Abrir Runas</Link>
              </article>

              <article className={styles.oracleCard}>
                <h3>I Ching</h3>
                {hubData?.latestIChing ? (
                  <>
                    <p>{getOracleHeadline(ichingPayload)}</p>
                    <small>{formatDate(hubData.latestIChing.updated_at || hubData.latestIChing.week_start)}</small>
                  </>
                ) : (
                  <p className={`${styles.emptyState} ${styles.emptyStateAnimated}`}>
                    Sem módulo semanal de I Ching ainda.
                  </p>
                )}
                <Link to="/iching">Abrir I Ching</Link>
              </article>

              <article className={styles.oracleCard}>
                <h3>Numerologia pessoal</h3>
                <p>
                  Caminho de Vida <strong>{numerologyPersonal?.life_path_number || profile?.life_path_number || '-'}</strong> ·
                  Nascimento <strong> {numerologyPersonal?.birthday_number || profile?.birthday_number || '-'}</strong>
                </p>
                <small>{numerologyPersonal?.input_birth_date ? `Base: ${formatDate(numerologyPersonal.input_birth_date)}` : 'Base pessoal pendente.'}</small>
                <Link to="/numerologia">Abrir Numerologia</Link>
              </article>

              <article className={styles.oracleCard}>
                <h3>Numerologia semanal</h3>
                {hubData?.latestNumerologyWeekly ? (
                  <>
                    <p>{getOracleHeadline(weeklyNumerologyPayload)}</p>
                    <small>{formatDate(hubData.latestNumerologyWeekly.week_start || hubData.latestNumerologyWeekly.created_at)}</small>
                  </>
                ) : (
                  <p className={`${styles.emptyState} ${styles.emptyStateAnimated}`}>
                    Gere sua numerologia semanal para ativar este bloco.
                  </p>
                )}
                <Link to="/numerologia">Gerar semanal</Link>
              </article>

              <article className={styles.oracleCard}>
                <h3>Síntese Semanal</h3>
                {latestSynthesis ? (
                  <>
                    <p>{latestSynthesis.final_reading?.one_liner || latestSynthesis.final_reading?.title || 'Síntese disponível.'}</p>
                    <small>{latestSynthesis.week_ref || formatDate(latestSynthesis.created_at)}</small>
                  </>
                ) : (
                  <p className={`${styles.emptyState} ${styles.emptyStateAnimated}`}>
                    Sua síntese integrada ainda não foi gerada.
                  </p>
                )}
                <Link to="/oraculo/geral">Abrir Síntese</Link>
              </article>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
