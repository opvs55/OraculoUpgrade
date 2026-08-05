import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import FlippableCard from '../../components/FlippableCard/FlippableCard';
import { useAuth } from '../../hooks/useAuth';
import { oraclesApi } from '../../services/api/oraclesApi';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import { baralhoDetalhado } from '../../tarotDeck';
import styles from './FeaturePage.module.css';
import hero from './CartaDoDiaPage.module.css';

const CARD_BACK_IMAGE = '/assets/cartas/verso.svg';
const SPARKLE_POSITIONS = [
  { top: '12%', left: '18%', delay: '0s' },
  { top: '22%', left: '78%', delay: '0.6s' },
  { top: '68%', left: '12%', delay: '1.2s' },
  { top: '75%', left: '82%', delay: '1.8s' },
  { top: '8%', left: '50%', delay: '2.4s' },
];

const formatOracleDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const formatted = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// A mensagem vem como JSON serializado (nome_do_dia, mensagem,
// intencao_pratica) — mas leituras antigas ou uma falha da IA podem ter
// deixado só texto solto. Tenta o formato novo, cai pro texto puro.
const parseInterpretation = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.mensagem) return parsed;
  } catch {
    // formato antigo: texto simples
  }
  return { mensagem: raw };
};

export default function CartaDoDiaPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [isFlipped, setIsFlipped] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  const query = useQuery({
    queryKey: ['oracles', 'daily-oracle', userId],
    queryFn: () => oraclesApi.getDailyOracle(),
    enabled: !!userId,
  });

  const data = query.data;
  const cardImage = data ? resolveTarotCardImage(data.card_name) : null;
  const cardInfo = data ? baralhoDetalhado.find((card) => card.nome === data.card_name) : null;
  const keywords = cardInfo?.palavras_chave?.direito?.slice(0, 4) || [];
  const message = parseInterpretation(data?.interpretation);

  // A carta chega de costas e se revela sozinha pouco depois de carregar —
  // um pequeno momento de pausa antes da mensagem do dia, em vez de tudo
  // aparecer estático de uma vez.
  useEffect(() => {
    setIsFlipped(false);
    if (!data) return;
    const timer = setTimeout(() => setIsFlipped(true), 500);
    return () => clearTimeout(timer);
  }, [data?.oracle_date, data?.card_name]);

  const handleShare = async () => {
    if (!data) return;
    const headline = message?.nome_do_dia ? `${message.nome_do_dia} — ` : '';
    const shareText = `${headline}${data.card_name} é a carta do meu dia hoje no Esotericon.`;
    const shareUrl = window.location.origin + '/oraculo/dia';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Carta do Dia — Esotericon', text: shareText, url: shareUrl });
        return;
      } catch (err) {
        // Pessoa cancelou o compartilhamento (fechou a folha nativa) — não é
        // erro, não faz nada. Qualquer outra falha cai pro clipboard abaixo.
        if (err?.name === 'AbortError') return;
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareFeedback('Copiado! Cole onde quiser compartilhar.');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Oráculos</p>
        <h1>Carta do Dia</h1>
        <p className={styles.subtitle}>Uma única carta pra abrir o dia com intenção.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {query.isLoading && <Loader />}

        {query.isError && (
          <div className={styles.errorCard}>
            <h2>Falha ao carregar a carta do dia</h2>
            <p>{query.error?.message || 'Não foi possível carregar sua carta de hoje.'}</p>
            <button type="button" className={styles.primaryButton} onClick={() => query.refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {!query.isLoading && !query.isError && data && (
          <div className={styles.resultCard}>
            <div className={styles.statusRow}>
              <span className={styles.badge}>{formatOracleDate(data.oracle_date)}</span>
            </div>

            <div className={hero.stage}>
              <div className={hero.glow} />
              {SPARKLE_POSITIONS.map((pos, index) => (
                <span
                  key={index}
                  className={hero.sparkle}
                  style={{ top: pos.top, left: pos.left, animationDelay: pos.delay }}
                  aria-hidden="true"
                >
                  ✦
                </span>
              ))}

              {cardImage && (
                <div className={hero.cardFrame}>
                  <FlippableCard
                    isFlipped={isFlipped}
                    frontImage={cardImage}
                    backImage={CARD_BACK_IMAGE}
                    cardName={data.card_name}
                  />
                </div>
              )}

              {message?.nome_do_dia && <h2 className={hero.headline}>{message.nome_do_dia}</h2>}
              <p className={hero.cardLabel}>{data.card_name}</p>
            </div>

            <button type="button" className={hero.shareButton} onClick={handleShare}>
              ✦ Compartilhar
            </button>
            {shareFeedback && <p className={hero.shareFeedback}>{shareFeedback}</p>}

            {keywords.length > 0 && (
              <div className={styles.chipsRow}>
                {keywords.map((word) => (
                  <span key={word} className={styles.themeChip}>{word}</span>
                ))}
              </div>
            )}

            {message?.mensagem ? (
              <div className={styles.factGrid}>
                <div className={styles.factCard}>
                  <h4 className={styles.factCardLabel}>A energia do dia</h4>
                  <p>{message.mensagem}</p>
                </div>
                {message.intencao_pratica && (
                  <div className={styles.factCard}>
                    <h4 className={styles.factCardLabel}>Pra hoje</h4>
                    <p>{message.intencao_pratica}</p>
                  </div>
                )}
                {message.energia_evitar && (
                  <div className={styles.factCard}>
                    <h4 className={styles.factCardLabel}>O que evitar</h4>
                    <p>{message.energia_evitar}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>Sua mensagem do dia está sendo preparada — volte em instantes.</p>
            )}

            {cardInfo && (
              <div className={styles.sectionBlock}>
                <h3>Sobre {cardInfo.nome}</h3>
                <p>{cardInfo.descricao}</p>
                <Link to={`/biblioteca/${cardInfo.slug}`} className={styles.aboutLink}>
                  Ver significado completo →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
