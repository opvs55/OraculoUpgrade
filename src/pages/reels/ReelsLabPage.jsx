import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import styles from './ReelsLabPage.module.css';

const formatDate = (value) => {
  if (!value) return 'Agora';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Agora';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

function useReelsLabData(userId) {
  return useQuery({
    queryKey: ['reels-lab', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];

      const safeQuery = async (query, fallback = []) => {
        const { data, error } = await query;
        if (error) return fallback;
        return data ?? fallback;
      };

      const [weeklyCards, unifiedReadings, runesModules, ichingModules, numerologyWeekly] = await Promise.all([
        safeQuery(
          supabase
            .from('weekly_cards')
            .select('id, card_name, created_at, week_start')
            .eq('user_id', userId)
            .order('week_start', { ascending: false })
            .limit(4),
        ),
        safeQuery(
          supabase
            .from('unified_readings')
            .select('id, created_at, week_ref, final_reading')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(4),
        ),
        safeQuery(
          supabase
            .from('oracle_weekly_modules')
            .select('id, updated_at, week_start, output_payload, oracle_type')
            .eq('user_id', userId)
            .like('oracle_type', '%runes%')
            .order('updated_at', { ascending: false })
            .limit(3),
        ),
        safeQuery(
          supabase
            .from('oracle_weekly_modules')
            .select('id, updated_at, week_start, output_payload, oracle_type')
            .eq('user_id', userId)
            .like('oracle_type', '%iching%')
            .order('updated_at', { ascending: false })
            .limit(3),
        ),
        safeQuery(
          supabase
            .from('numerology_weekly_readings')
            .select('id, created_at, week_start, result_payload')
            .eq('user_id', userId)
            .order('week_start', { ascending: false })
            .limit(3),
        ),
      ]);

      const reels = [];

      (weeklyCards || []).forEach((row) => {
        reels.push({
          id: `tarot-${row.id}`,
          kind: 'Tarot semanal',
          title: row.card_name ? `A energia da semana: ${row.card_name}` : 'A energia da sua semana',
          hook: 'Mensagem rápida para te alinhar com a carta da semana.',
          description: 'Este reel conecta o simbolismo da sua carta semanal com um foco prático para agora.',
          createdAt: row.created_at || row.week_start,
          ctaLabel: 'Abrir Tarot',
          ctaTo: '/tarot',
          duration: '00:22',
        });
      });

      (unifiedReadings || []).forEach((row) => {
        reels.push({
          id: `synthesis-${row.id}`,
          kind: 'Síntese semanal',
          title: row.final_reading?.title || 'Síntese da semana',
          hook: row.final_reading?.one_liner || 'Resumo objetivo da combinação Tarot + Runas + I Ching + Numerologia.',
          description: 'Formato curto com os sinais centrais para agir com clareza.',
          createdAt: row.created_at,
          ctaLabel: 'Abrir Síntese',
          ctaTo: '/oraculo/geral',
          duration: '00:36',
        });
      });

      (runesModules || []).forEach((row) => {
        reels.push({
          id: `runes-${row.id}`,
          kind: 'Runas',
          title: 'Runas da semana em 30 segundos',
          hook: row.output_payload?.headline || row.output_payload?.summary || 'Direcionamento simbólico para seu ciclo atual.',
          description: 'Leitura rápida dos temas e da melhor postura para a semana.',
          createdAt: row.updated_at || row.week_start,
          ctaLabel: 'Abrir Runas',
          ctaTo: '/runas',
          duration: '00:28',
        });
      });

      (ichingModules || []).forEach((row) => {
        reels.push({
          id: `iching-${row.id}`,
          kind: 'I Ching',
          title: 'I Ching semanal em 30 segundos',
          hook: row.output_payload?.headline || row.output_payload?.summary || 'Clareza estratégica para o próximo passo.',
          description: 'Recorte direto do seu hexagrama para apoiar decisões imediatas.',
          createdAt: row.updated_at || row.week_start,
          ctaLabel: 'Abrir I Ching',
          ctaTo: '/iching',
          duration: '00:30',
        });
      });

      (numerologyWeekly || []).forEach((row) => {
        reels.push({
          id: `numerology-${row.id}`,
          kind: 'Numerologia',
          title: 'Numerologia da semana',
          hook: row.result_payload?.headline || row.result_payload?.summary || row.result_payload?.weekly_focus || 'Entenda a vibração numerológica da sua semana.',
          description: 'Vídeo curto com seu tom energético e foco recomendado.',
          createdAt: row.created_at || row.week_start,
          ctaLabel: 'Abrir Numerologia',
          ctaTo: '/numerologia',
          duration: '00:26',
        });
      });

      return reels
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 14);
    },
  });
}

export default function ReelsLabPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useReelsLabData(user?.id);
  const reels = data || [];
  const handleBackClick = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/perfil');
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <button type="button" className={styles.backButton} onClick={handleBackClick}>
            ← Voltar
          </button>
          <p className={styles.eyebrow}>Laboratório</p>
          <h1>Reels Oraculares</h1>
          <p>
            Um feed curto para consumo rápido dos sinais da semana, sem substituir as leituras completas.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/perfil" className={styles.secondaryButton}>
            Meu Perfil
          </Link>
        </div>
      </header>

      <section className={styles.panel}>
        <h2>Como isso evolui no produto</h2>
        <ul>
          <li>Fase 1: reels pessoais gerados dos seus próprios oráculos</li>
          <li>Fase 2: salvar favoritos e playlist por tema</li>
          <li>Fase 3: versões compartilháveis opcionais</li>
        </ul>
      </section>

      {isLoading ? (
        <section className={styles.emptyCard}>
          <p>Montando seu feed de reels...</p>
        </section>
      ) : reels.length === 0 ? (
        <section className={styles.emptyCard}>
          <h2>Sem reels por enquanto</h2>
          <p>Gere seus oráculos semanais para habilitar os primeiros reels automáticos.</p>
          <div className={styles.reelActions}>
            <Link to="/tarot" className={styles.ghostButton}>Tarot</Link>
            <Link to="/numerologia" className={styles.ghostButton}>Numerologia</Link>
            <Link to="/runas" className={styles.ghostButton}>Runas</Link>
            <Link to="/iching" className={styles.ghostButton}>I Ching</Link>
          </div>
        </section>
      ) : (
        <div className={styles.layout}>
          <div className={styles.feed}>
            {reels.map((reel) => (
              <article key={reel.id} className={styles.reelCard}>
                <div className={styles.reelVideoShell}>
                  <span className={styles.reelChip}>{reel.kind}</span>
                  <div className={styles.reelCenter}>
                    <h3 className={styles.reelTitle}>{reel.title}</h3>
                    <p className={styles.reelSubtitle}>{reel.hook}</p>
                    <p className={styles.reelMeta}>
                      {reel.duration} • {formatDate(reel.createdAt)}
                    </p>
                  </div>
                </div>
                <div className={styles.reelControls}>
                  <p>{reel.description}</p>
                  <div className={styles.reelActions}>
                    <button type="button" className={styles.ghostButton}>Salvar</button>
                    <button type="button" className={styles.ghostButton}>Compartilhar</button>
                    <Link to={reel.ctaTo} className={styles.solidButton}>{reel.ctaLabel}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className={styles.reelAside}>
            <section className={styles.panel}>
              <h2>Navegação rápida</h2>
              <ul>
                <li><Link to="/perfil">Meu Perfil</Link></li>
                <li><Link to="/meu-grimorio">Grimório</Link></li>
                <li><Link to="/oraculo/geral">Síntese Semanal</Link></li>
              </ul>
            </section>
            <section className={styles.panel}>
              <h2>Direção de produto</h2>
              <p>
                Estes reels são pessoais e curtos, funcionando como porta de entrada para a leitura completa.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
