import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInteractiveSession } from '../../features/interactive-readings/useInteractiveReadings';
import styles from './InteractiveReadingSessionPage.module.css';

function normalizeMessages(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.data?.messages)) return payload.data.messages;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeCards(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.cards)) return payload.cards;
  if (Array.isArray(payload?.draws)) return payload.draws;
  if (Array.isArray(payload?.data?.draws)) return payload.data.draws;
  return [];
}

export default function InteractiveReadingSessionPage() {
  const { sessionId } = useParams();
  const [message, setMessage] = useState('');
  const [drawNote, setDrawNote] = useState('');
  const { user } = useAuth();
  const session = useInteractiveSession(sessionId, user?.id);

  const sessionData = session.session || {};
  const messages = useMemo(() => normalizeMessages(session.messages || []), [session.messages]);
  const cards = useMemo(() => normalizeCards(sessionData.draws || sessionData.cards || []), [sessionData.draws, sessionData.cards]);
  const status = sessionData.status || 'preparing';

  const handleSend = (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;
    session.sendMessage({ kind: 'text', content }).then(() => setMessage(''));
  };

  const handleDraw = () => {
    session.drawCard({
      note: drawNote.trim() || undefined,
      source: 'manual',
    });
  };

  const handleEndRequest = () => {
    session.endRequest({ reason: 'user_requested' });
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Sessão ao vivo</p>
          <h1>Leitura interativa</h1>
          <p>Chat, tiragem e encerramento consensual no mesmo fluxo.</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.statusPill}>{status}</span>
          <Link to={`/leituras-interativas/${sessionId}/encerramento`} className={styles.ghostLink}>
            Encerrar sessão
          </Link>
        </div>
      </header>

      {session.isLoadingSession ? (
        <section className={styles.placeholder}>
          <p>Conectando à sessão...</p>
        </section>
      ) : session.errorSession ? (
        <section className={styles.placeholder}>
          <h2>Não foi possível carregar a sessão</h2>
          <p>{session.errorSession.message}</p>
          <p className={styles.hint}>Verifique se o backend já expôs /readings/sessions/:id.</p>
        </section>
      ) : (
        <div className={styles.layout}>
          <section className={styles.panel}>
            <h2>Chat da leitura</h2>
            <div className={styles.messages}>
              {messages.length ? (
                messages.map((item) => (
                  <article key={item.id || `${item.created_at}-${item.content}`} className={styles.messageItem}>
                    <p>{item.content || item.text || 'Mensagem sem conteúdo.'}</p>
                    <small>{item.kind || 'text'}</small>
                  </article>
                ))
              ) : (
                <p className={styles.empty}>Sem mensagens ainda. Inicie a conversa da sessão.</p>
              )}
            </div>
            <form className={styles.inlineForm} onSubmit={handleSend}>
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Digite uma mensagem para a sessão"
              />
              <button type="submit" disabled={session.isSendingMessage}>
                {session.isSendingMessage ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          </section>

          <section className={styles.panel}>
            <h2>Tiragem de cartas</h2>
            <div className={styles.cardsGrid}>
              {cards.length ? (
                cards.map((card, index) => (
                  <article key={card.id || `${card.card_name}-${index}`} className={styles.cardItem}>
                    <strong>{card.card_name || card.name || `Carta ${index + 1}`}</strong>
                    <span>{card.orientation || 'upright'}</span>
                  </article>
                ))
              ) : (
                <p className={styles.empty}>Nenhuma carta foi tirada nesta sessão.</p>
              )}
            </div>
            <div className={styles.drawBox}>
              <input
                type="text"
                value={drawNote}
                onChange={(event) => setDrawNote(event.target.value)}
                placeholder="Nota opcional para a tiragem"
              />
              <button type="button" onClick={handleDraw} disabled={session.isDrawingCard}>
                {session.isDrawingCard ? 'Tirando...' : 'Tirar carta'}
              </button>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Encerramento consensual</h2>
            <p>
              Quando a leitura estiver concluída, solicite encerramento. A sessão só fecha após confirmação dos dois lados.
            </p>
            <button type="button" onClick={handleEndRequest} disabled={session.isEndingRequest}>
              {session.isEndingRequest ? 'Solicitando...' : 'Solicitar encerramento'}
            </button>
            <Link to={`/leituras-interativas/s/${sessionId}/encerrar`} className={styles.primaryLink}>
              Ir para tela de encerramento
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
