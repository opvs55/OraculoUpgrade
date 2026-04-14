import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInteractiveQueue } from '../../features/interactive-readings/useInteractiveReadings';
import styles from './InteractiveReadingQueuePage.module.css';

const MODE_OPTIONS = [
  { id: 'reader', label: 'Estou apto para ler', description: 'Você entra como leitor(a) para atender alguém.' },
  { id: 'seeker', label: 'Quero ser lido(a)', description: 'Você entra para receber uma leitura de outro membro.' },
  { id: 'both', label: 'Posso fazer ambos', description: 'Sistema escolhe dinamicamente pela melhor fila.' },
];

export default function InteractiveReadingQueuePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState(location.state?.mode || 'seeker');
  const [feedback, setFeedback] = useState('');

  const {
    queue,
    isLoadingQueue,
    errorQueue,
    isJoiningQueue,
    isLeavingQueue,
    joinQueue,
    leaveQueue,
    matchedSessionId,
  } = useInteractiveQueue(user?.id);

  const hasActiveQueue = Boolean(queue?.status && !['cancelled', 'timeout'].includes(queue.status));

  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    navigate('/leituras-interativas');
  };

  useEffect(() => {
    if (matchedSessionId) {
      navigate(`/leituras-interativas/s/${matchedSessionId}`);
    }
  }, [matchedSessionId, navigate]);

  const handleJoinQueue = async () => {
    setFeedback('');
    try {
      await joinQueue({ mode: selectedMode });
      setFeedback('Você entrou na fila. Aguarde o match.');
    } catch (error) {
      setFeedback(error.message || 'Não foi possível entrar na fila.');
    }
  };

  const handleLeaveQueue = async () => {
    setFeedback('');
    try {
      await leaveQueue({ reason: 'user_cancelled' });
      setFeedback('Você saiu da fila.');
    } catch (error) {
      setFeedback(error.message || 'Não foi possível sair da fila.');
    }
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <section className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBack}>← Voltar</button>
        <h1>Fila de leitura</h1>
        <p>Entre em uma fila segura e aguarde um match para iniciar a sessão.</p>
      </section>

      <section className={styles.body}>
        <h2>Escolha seu papel</h2>
        <div className={styles.actions}>
          {MODE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.id}
              className={selectedMode === option.id ? styles.primaryButton : styles.ghostButton}
              onClick={() => setSelectedMode(option.id)}
              disabled={isJoiningQueue || hasActiveQueue}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          {MODE_OPTIONS.find((item) => item.id === selectedMode)?.description}
        </p>

        <div className={styles.statusRow}>
          <article className={styles.pill}>
            <p>Status</p>
            <strong>{isLoadingQueue ? 'Carregando…' : queue?.status || 'fora da fila'}</strong>
          </article>
          <article className={styles.pill}>
            <p>Modo</p>
            <strong>{queue?.mode || selectedMode}</strong>
          </article>
          <article className={styles.pill}>
            <p>Sessão</p>
            <strong>{matchedSessionId ? 'match encontrado' : 'aguardando'}</strong>
          </article>
        </div>

        <div className={styles.actions}>
        {!hasActiveQueue ? (
            <button type="button" className={styles.primaryButton} onClick={handleJoinQueue} disabled={isJoiningQueue}>
              {isJoiningQueue ? 'Entrando...' : 'Entrar na fila'}
            </button>
          ) : (
            <button type="button" className={styles.dangerButton} onClick={handleLeaveQueue} disabled={isLeavingQueue}>
              {isLeavingQueue ? 'Saindo...' : 'Sair da fila'}
            </button>
          )}
          {matchedSessionId && (
            <Link to={`/leituras-interativas/s/${matchedSessionId}`} className={styles.ghostButton}>
              Entrar na sessão
            </Link>
          )}
          <Link to="/leituras-interativas/historico" className={styles.ghostButton}>
            Ver histórico
          </Link>
        </div>
        {feedback && <p className={styles.hint}>{feedback}</p>}
        {errorQueue && <p className={styles.error}>{errorQueue.message}</p>}
      </section>
    </div>
  );
}
