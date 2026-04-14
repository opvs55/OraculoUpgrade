import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useInteractiveSession } from '../../features/interactive-readings/useInteractiveReadings';
import styles from './InteractiveReadingClosePage.module.css';

export default function InteractiveReadingClosePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    session,
    isLoadingSession,
    errorSession,
    endRequest,
    endConfirm,
    isEndingRequest,
    isEndingConfirm,
  } = useInteractiveSession(sessionId);

  const myParticipant = (session?.participants || []).find((participant) => participant?.is_me);
  const hasRequested = Boolean(myParticipant?.end_requested_at || myParticipant?.endRequestedAt);
  const hasConfirmed = Boolean(myParticipant?.end_confirmed_at || myParticipant?.endConfirmedAt);

  const sessionStatus = String(session?.status || '').toLowerCase();
  const isClosed = sessionStatus === 'closed';

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <h1>Encerramento consensual</h1>
        <p>
          Ambos os participantes precisam confirmar o encerramento. Isso garante uma finalização clara da leitura.
        </p>
      </header>

      <section className={styles.panel}>
        <h2>Status atual</h2>
        {isLoadingSession ? (
          <p>Carregando status da sessão...</p>
        ) : errorSession ? (
          <p className={styles.error}>Falha ao carregar encerramento: {errorSession.message}</p>
        ) : (
          <>
            <p>
              Sessão: <strong>{session?.status || '—'}</strong>
            </p>
            <p>
              Seu status: <strong>{hasConfirmed ? 'Confirmado' : hasRequested ? 'Solicitado' : 'Aguardando'}</strong>
            </p>
          </>
        )}

        {!hasRequested && !isClosed && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => endRequest({ note: 'Encerramento solicitado pelo participante.' })}
            disabled={isEndingRequest}
          >
            {isEndingRequest ? 'Solicitando...' : 'Solicitar encerramento'}
          </button>
        )}

        {hasRequested && !hasConfirmed && !isClosed && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => endConfirm({ note: 'Encerramento confirmado pelo participante.' })}
            disabled={isEndingConfirm}
          >
            {isEndingConfirm ? 'Confirmando...' : 'Confirmar encerramento'}
          </button>
        )}

        {(isClosed || hasConfirmed) && (
          <div className={styles.successBox}>
            <p>Encerramento registrado com sucesso.</p>
            <div className={styles.actions}>
              <Link to="/leituras-interativas/historico" className={styles.secondaryButton}>
                Ir para histórico
              </Link>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate('/perfil')}>
                Voltar ao perfil
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
