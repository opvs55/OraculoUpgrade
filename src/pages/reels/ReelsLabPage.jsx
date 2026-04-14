import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReelsLab } from '../../features/reels/useReelsLab';
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

export default function ReelsLabPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    reels,
    isLoading,
    selectedType,
    setSelectedType,
    favoritesSet,
    toggleFavorite,
    registerView,
    registerCompletion,
  } = useReelsLab(user?.id);

  const filteredReels = useMemo(() => {
    if (selectedType === 'all') return reels;
    return reels.filter((reel) => reel.sourceType === selectedType);
  }, [reels, selectedType]);

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

      <section className={styles.filtersBar} aria-label="Filtros de oráculo">
        <button
          type="button"
          className={selectedType === 'all' ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setSelectedType('all')}
        >
          Todos
        </button>
        <button
          type="button"
          className={selectedType === 'tarot_weekly' ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setSelectedType('tarot_weekly')}
        >
          Tarot
        </button>
        <button
          type="button"
          className={selectedType === 'unified_reading' ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setSelectedType('unified_reading')}
        >
          Síntese
        </button>
        <button
          type="button"
          className={selectedType === 'runes_weekly' ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setSelectedType('runes_weekly')}
        >
          Runas
        </button>
        <button
          type="button"
          className={selectedType === 'iching_weekly' ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setSelectedType('iching_weekly')}
        >
          I Ching
        </button>
        <button
          type="button"
          className={selectedType === 'numerology_weekly' ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setSelectedType('numerology_weekly')}
        >
          Numerologia
        </button>
      </section>

      {isLoading ? (
        <section className={styles.emptyCard}>
          <p>Montando seu feed de reels...</p>
        </section>
      ) : filteredReels.length === 0 ? (
        <section className={styles.emptyCard}>
          <h2>Sem reels por enquanto</h2>
          <p>Gere seus oráculos semanais ou ajuste o filtro para habilitar os reels.</p>
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
            {filteredReels.map((reel) => (
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
                    <button
                      type="button"
                      className={styles.ghostButton}
                      onClick={() => toggleFavorite(reel.id)}
                    >
                      {favoritesSet.has(reel.id) ? 'Salvo' : 'Salvar'}
                    </button>
                    <button type="button" className={styles.ghostButton}>Compartilhar</button>
                    <button
                      type="button"
                      className={styles.ghostButton}
                      onClick={() => registerView(reel.id, 12)}
                    >
                      Marcar view
                    </button>
                    <button
                      type="button"
                      className={styles.ghostButton}
                      onClick={() => registerCompletion(reel.id, reel.durationSeconds || 30)}
                    >
                      Completo
                    </button>
                    <Link to={reel.ctaTo} className={styles.solidButton}>
                      {reel.ctaLabel}
                    </Link>
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
