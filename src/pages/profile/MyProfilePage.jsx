import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../supabaseClient';
import Loader from '../../components/common/Loader/Loader';
import { useReelsLab } from '../../features/reels/useReelsLab';
import styles from './MyProfilePage.module.css';

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

function useMyProfileOverview(userId) {
  return useQuery({
    queryKey: ['myProfileOverview', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      const safeQuery = async (query) => {
        const { data, error } = await query;
        if (error) {
          console.warn('Falha em consulta do perfil privado:', error.message);
          return [];
        }
        return data || [];
      };

      const [recentReadings, weeklyCardRows, unifiedRows, reelOfDayRow] = await Promise.all([
        safeQuery(
          supabase
            .from('readings')
            .select('id, created_at, spread_type')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
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
            .from('reels')
            .select('id, title, hook, cta_path, source_type, updated_at')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1),
        ),
      ]);

      return {
        recentReadings,
        latestWeeklyCard: weeklyCardRows[0] || null,
        latestUnifiedReading: unifiedRows[0] || null,
        reelOfDay: reelOfDayRow[0] || null,
      };
    },
  });
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile(user?.id);
  const { data: overview, isLoading: isOverviewLoading } = useMyProfileOverview(user?.id);
  const reelsLab = useReelsLab(user?.id);

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    navigate('/meu-grimorio');
  };

  if (isProfileLoading || isOverviewLoading) {
    return (
      <div className={`content_wrapper ${styles.page}`}>
        <Loader customText="Montando seu perfil..." />
      </div>
    );
  }

  const latestCard = overview?.latestWeeklyCard;
  const latestSynthesis = overview?.latestUnifiedReading;
  const readings = overview?.recentReadings || [];
  const reelOfDay = overview?.reelOfDay || reelsLab.reels[0] || null;
  const avatarUrl = profile?.avatar_url || 'https://i.imgur.com/6VBx3io.png';

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <button type="button" className={styles.backButton} onClick={handleBack}>
            ← Voltar
          </button>
          <div className={styles.topActions}>
            <Link to="/meu-grimorio" className={styles.secondaryButton}>Grimório</Link>
            <Link to="/reels" className={styles.secondaryButton}>Reels</Link>
          </div>
        </header>

        <section className={styles.hero}>
          <img src={avatarUrl} alt={`Avatar de ${profile?.username || 'usuário'}`} className={styles.avatar} />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Meu Perfil</p>
            <h1>{profile?.full_name || profile?.username || 'Seu espaço oracular'}</h1>
            <p className={styles.username}>@{profile?.username || 'usuario'}</p>
            {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
            <div className={styles.heroActions}>
              <Link to="/perfil/editar" className={styles.secondaryButton}>Editar dados</Link>
              {profile?.username && (
                <Link to={`/perfil/${profile.username}`} className={styles.primaryButton}>
                  Ver perfil público
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className={styles.reelOfDay}>
          <div className={styles.reelOfDayHeader}>
            <p>Reel do dia</p>
            <Link to="/reels">Ver todos</Link>
          </div>
          {reelOfDay ? (
            <div className={styles.reelOfDayCard}>
              <strong>{reelOfDay.title}</strong>
              <p>{reelOfDay.hook || 'Resumo rápido dos sinais do seu momento atual.'}</p>
              <div className={styles.reelOfDayMeta}>
                <span>{reelOfDay.source_type || reelOfDay.kind || 'oráculo'}</span>
                <Link to={reelOfDay.cta_path || reelOfDay.ctaTo || '/reels'}>Abrir</Link>
              </div>
            </div>
          ) : (
            <p className={styles.empty}>Gere seus primeiros oráculos para desbloquear o reel do dia.</p>
          )}
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Momento atual</h2>
            {latestCard ? (
              <p>
                Carta da semana: <strong>{latestCard.card_name || 'registrada'}</strong> ({formatDate(latestCard.week_start || latestCard.created_at)}).
              </p>
            ) : (
              <p>Você ainda não revelou sua carta da semana.</p>
            )}
            {latestSynthesis ? (
              <p>
                Síntese: <strong>{latestSynthesis.final_reading?.title || 'Síntese Semanal'}</strong>.
              </p>
            ) : (
              <p>Síntese Semanal ainda não gerada nesta conta.</p>
            )}
            <Link to="/oraculo/geral" className={styles.inlineLink}>Abrir Síntese Semanal</Link>
          </article>

          <article className={styles.card}>
            <h2>Linha do tempo curta</h2>
            {readings.length > 0 ? (
              <ul className={styles.timelineList}>
                {readings.map((reading) => (
                  <li key={reading.id}>
                    <span>{formatDate(reading.created_at)}</span>
                    <p>{reading.spread_type || 'Leitura de Tarot'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Suas leituras aparecerão aqui conforme o uso.</p>
            )}
            <Link to="/meu-grimorio" className={styles.inlineLink}>Ver histórico completo</Link>
          </article>

          <article className={styles.card}>
            <h2>Laboratório de Reels</h2>
            <p>
              Transforme sinais da semana em vídeos curtos (MVP pessoal). Esta etapa prepara o formato
              de reels sem depender de comunidade.
            </p>
            <Link to="/reels" className={styles.primaryButton}>Abrir laboratório</Link>
          </article>
        </section>
      </div>
    </div>
  );
}
