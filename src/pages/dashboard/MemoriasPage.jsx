import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { sortearUmaCarta } from '../../services/tarotService';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import styles from '../features/FeaturePage.module.css';

const formatEntryDate = (isoString) => {
  if (!isoString) return '';
  const formatted = new Date(isoString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

function JournalEntryCard({ entry, onReflect, onDelete, isReflectingThis, isDeleting }) {
  const cardImage = entry.reflection_card_name ? resolveTarotCardImage(entry.reflection_card_name) : null;

  const handleReflect = () => {
    const [drawnCard] = sortearUmaCarta();
    onReflect({ id: entry.id, cardName: drawnCard.nome });
  };

  return (
    <div className={styles.factCard}>
      <div className={styles.statusRow}>
        <span className={styles.badge}>{formatEntryDate(entry.created_at)}</span>
        <button
          type="button"
          className={styles.aboutLink}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => onDelete(entry.id)}
          disabled={isDeleting}
        >
          Excluir
        </button>
      </div>
      <p>{entry.content}</p>

      {entry.reflection_message ? (
        <div className={styles.sectionBlock}>
          <h3>{cardImage ? entry.reflection_card_name : 'Sua carta de reflexão'}</h3>
          {cardImage && <img src={cardImage} alt={entry.reflection_card_name} className={styles.cardImage} />}
          <p>{entry.reflection_message}</p>
        </div>
      ) : (
        <button type="button" className={styles.primaryButton} onClick={handleReflect} disabled={isReflectingThis}>
          {isReflectingThis ? 'Sorteando...' : 'Avaliar esta reflexão com uma tiragem'}
        </button>
      )}
    </div>
  );
}

export default function MemoriasPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState('');

  const {
    entries,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createEntry,
    isCreating,
    createError,
    deleteEntry,
    isDeleting,
    reflectOnEntry,
    isReflecting,
    reflectingId,
  } = useJournalEntries(user?.id);

  const handleSave = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    createEntry(content, { onSuccess: () => setDraft('') });
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Diário</p>
        <h1>Suas Memórias</h1>
        <p className={styles.subtitle}>
          Um pequeno diário pra registrar sua trajetória com as cartas. <Link to="/diario">Voltar ao Diário</Link>
        </p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        <form className={styles.form} onSubmit={handleSave}>
          <div className={styles.field}>
            <label htmlFor="journal-draft">Nova memória</label>
            <textarea
              id="journal-draft"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="O que você quer registrar hoje?"
              disabled={isCreating}
            />
          </div>
          <button type="submit" className={styles.primaryButton} disabled={isCreating || !draft.trim()}>
            {isCreating ? 'Salvando...' : 'Salvar memória'}
          </button>
          {createError && <p className={styles.inlineError}>{createError.message}</p>}
        </form>
      </section>

      <section className={styles.card}>
        {isLoading && <Loader />}

        {isError && (
          <div className={styles.errorCard}>
            <h2>Falha ao carregar suas memórias</h2>
            <button type="button" className={styles.primaryButton} onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !isError && entries.length === 0 && (
          <div className={styles.emptyState}>
            <p>Nenhuma memória registrada ainda. Escreva a primeira acima.</p>
          </div>
        )}

        {!isLoading && !isError && entries.length > 0 && (
          <div className={styles.factGrid}>
            {entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onReflect={reflectOnEntry}
                onDelete={deleteEntry}
                isReflectingThis={isReflecting && reflectingId === entry.id}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}

        {hasNextPage && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </button>
        )}
      </section>
    </div>
  );
}
