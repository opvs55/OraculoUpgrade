import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { sortearUmaCarta } from '../../services/tarotService';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import pageStyles from '../features/FeaturePage.module.css';
import styles from './MemoriasPage.module.css';

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
    <div className={styles.entryCard}>
      <div className={styles.entryHeader}>
        <span className={styles.entryDate}>{formatEntryDate(entry.created_at)}</span>
        <button
          type="button"
          className={styles.entryDeleteButton}
          onClick={() => onDelete(entry.id)}
          disabled={isDeleting}
        >
          Excluir
        </button>
      </div>

      <p className={styles.entryContent}>{entry.content}</p>

      {entry.reflection_message ? (
        <div className={styles.reflectionBlock}>
          {cardImage && (
            <img src={cardImage} alt={entry.reflection_card_name} className={styles.reflectionImage} />
          )}
          <div className={styles.reflectionText}>
            {entry.reflection_card_name && (
              <p className={styles.reflectionCardName}>{entry.reflection_card_name}</p>
            )}
            <p className={styles.reflectionMessage}>{entry.reflection_message}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.reflectButton}
          onClick={handleReflect}
          disabled={isReflectingThis}
        >
          {isReflectingThis ? '✦ Sorteando...' : '✦ Avaliar esta reflexão com uma tiragem'}
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
    <div className={`content_wrapper ${pageStyles.page}`}>
      <header className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Diário</p>
        <h1>Suas Memórias</h1>
        <p className={pageStyles.subtitle}>
          Um pequeno diário pra registrar sua trajetória com as cartas. <Link to="/diario">Voltar ao Diário</Link>
        </p>
      </header>

      <DecorativeDivider />

      <section className={pageStyles.card}>
        <form className={styles.composer} onSubmit={handleSave}>
          <label htmlFor="journal-draft" className={styles.composerLabel}>Nova memória</label>
          <textarea
            id="journal-draft"
            className={styles.composerTextarea}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="O que você quer registrar hoje?"
            disabled={isCreating}
          />
          <div className={styles.saveRow}>
            <button type="submit" className={styles.saveButton} disabled={isCreating || !draft.trim()}>
              {isCreating ? 'Salvando...' : '✦ Salvar memória'}
            </button>
            {createError && <p className={pageStyles.inlineError}>{createError.message}</p>}
          </div>
        </form>
      </section>

      <section className={pageStyles.card}>
        {isLoading && <Loader />}

        {isError && (
          <div className={pageStyles.errorCard}>
            <h2>Falha ao carregar suas memórias</h2>
            <button type="button" className={pageStyles.primaryButton} onClick={() => refetch()}>
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
          <div className={styles.entryGrid}>
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
          <div className={styles.loadMoreRow}>
            <button
              type="button"
              className={pageStyles.primaryButton}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
