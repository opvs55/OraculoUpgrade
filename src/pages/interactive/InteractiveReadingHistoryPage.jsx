import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInteractiveHistory } from '../../features/interactive-readings/useInteractiveReadings';
import styles from './InteractiveReadingHistoryPage.module.css';

const formatDate = (value) => {
  if (!value) return 'Sem data';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const toSharePath = (slug) => `${window.location.origin}/public/readings/${slug}`;

export default function InteractiveReadingHistoryPage() {
  const [notice, setNotice] = useState('');
  const {
    history,
    isLoadingHistory,
    errorHistory,
    createShare,
    updateShare,
    revokeShare,
    isCreatingShare,
    isUpdatingShare,
    isRevokingShare,
  } = useInteractiveHistory();

  const sortedEntries = useMemo(
    () => [...history].sort((a, b) => new Date(b.createdAt || b.ended_at || 0) - new Date(a.createdAt || a.ended_at || 0)),
    [history],
  );

  const handleCreateShare = async (sessionId) => {
    try {
      const data = await createShare({
        sessionId,
        payload: { visibility: 'unlisted', content_level: 'summary' },
      });
      const resolved = data?.share || data?.data?.share || data?.data || data;
      const slug = resolved?.slug;
      setNotice(
        slug
          ? `Compartilhamento criado. Link externo: ${toSharePath(slug)}`
          : 'Compartilhamento criado com sucesso.',
      );
    } catch (error) {
      setNotice(error.message || 'Falha ao criar compartilhamento.');
    }
  };

  const handleMakePublic = async (shareId) => {
    try {
      await updateShare({
        shareId,
        payload: { visibility: 'public' },
      });
      setNotice('Compartilhamento definido como público.');
    } catch (error) {
      setNotice(error.message || 'Falha ao atualizar visibilidade.');
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await revokeShare({ shareId });
      setNotice('Compartilhamento revogado.');
    } catch (error) {
      setNotice(error.message || 'Falha ao revogar compartilhamento.');
    }
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Leituras Interativas</p>
          <h1>Histórico Compartilhável</h1>
          <p>Revise sessões finalizadas e publique links externos anonimizados.</p>
        </div>
        <Link to="/leituras-interativas" className={styles.secondaryLink}>
          Voltar ao hub
        </Link>
      </header>

      {notice && <p className={styles.notice}>{notice}</p>}

      <section className={styles.panel}>
        <h2>Suas sessões</h2>
        {isLoadingHistory ? (
          <p>Carregando histórico...</p>
        ) : errorHistory ? (
          <p className={styles.errorText}>{errorHistory.message || 'Falha ao carregar histórico.'}</p>
        ) : sortedEntries.length ? (
          <div className={styles.list}>
            {sortedEntries.map((entry) => {
              const sessionId = entry.sessionId || entry.session_id || entry.id;
              const shares = Array.isArray(entry.shares) ? entry.shares : [];
              const share = shares[0] || entry.public_share || entry.share || null;
              const shareId = share?.id;
              const shareSlug = share?.slug;
              const shareVisibility = share?.visibility || 'unlisted';
              const sharePath = shareSlug ? toSharePath(shareSlug) : null;

              return (
                <article key={`${sessionId}-${entry.id || 'row'}`} className={styles.item}>
                  <div>
                    <strong>Sessão {entry.code || sessionId?.slice?.(0, 8) || '—'}</strong>
                    <p>Status: {entry.status || 'closed'}</p>
                    <p>Encerrada em: {formatDate(entry.ended_at || entry.created_at)}</p>
                  </div>
                  <div className={styles.actions}>
                    <Link to={`/leituras-interativas/historico/${sessionId}`}>Abrir</Link>
                    {!shareId && (
                      <button
                        type="button"
                        onClick={() => handleCreateShare(sessionId)}
                        disabled={isCreatingShare}
                      >
                        Criar share
                      </button>
                    )}
                    {shareId && (
                      <>
                        <span className={styles.badge}>{shareVisibility}</span>
                        {sharePath && (
                          <a href={sharePath} target="_blank" rel="noreferrer" className={styles.shareLink}>
                            {sharePath}
                          </a>
                        )}
                        {shareVisibility !== 'public' && (
                          <button
                            type="button"
                            onClick={() => handleMakePublic(shareId)}
                            disabled={isUpdatingShare}
                          >
                            Tornar público
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => handleRevoke(shareId)}
                          disabled={isRevokingShare}
                        >
                          Revogar
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>Você ainda não tem sessões finalizadas no histórico interativo.</p>
        )}
      </section>
    </div>
  );
}
