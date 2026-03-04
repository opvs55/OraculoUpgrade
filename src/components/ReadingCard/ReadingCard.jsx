// src/components/ReadingCard/ReadingCard.jsx (VERSÃO CORRIGIDA)

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import styles from './ReadingCard.module.css';

// Função auxiliar para encontrar a carta de maior destaque
function getHighlightCard(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return null;
  // Tenta encontrar cartas em posições-chave
  const outcomeCard = cards.find(c => c.posicao?.toLowerCase().includes('resultado'));
  if (outcomeCard) return outcomeCard;
  const presentCard = cards.find(c => c.posicao?.toLowerCase().includes('presente'));
  if (presentCard) return presentCard;
  // Se não encontrar, retorna a primeira carta
  return cards[0];
}

// Função para traduzir e formatar o tipo de tiragem
function formatSpreadType(spreadType) {
  const types = {
    celticCross: 'Cruz Celta',
    threeCards: 'Três Cartas',
    templeOfAphrodite: 'Templo de Afrodite',
    pathChoice: 'Escolha de Caminho'
  };
  return types[spreadType] || spreadType;
}

function ReadingCard({ reading }) {
  const highlightCard = getHighlightCard(reading.cards_data);
  const starCount = reading.stars?.[0]?.count ?? 0;
  const commentCount = reading.comments?.[0]?.count ?? 0;
  const pinnedCommentId = reading?.interpretation_data?.pinned_comment_id || null;

  const { data: pinnedCommentPreview } = useQuery({
    queryKey: ['readingPinnedPreview', reading.id, pinnedCommentId],
    queryFn: async () => {
      if (!pinnedCommentId) return null;
      const { data, error } = await supabase
        .from('comments')
        .select('id, comment_text')
        .eq('id', pinnedCommentId)
        .eq('reading_id', reading.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!pinnedCommentId,
  });

  // --- A MUDANÇA ESTÁ AQUI ---
  // Construímos a URL completa para garantir que o navegador a encontre.
  // import.meta.env.BASE_URL é uma variável do Vite que ajuda a construir o caminho correto.
  const imageUrl = highlightCard?.img 
    ? `${import.meta.env.BASE_URL}${highlightCard.img.startsWith('/') ? highlightCard.img.substring(1) : highlightCard.img}` 
    : null;
  // --- FIM DA MUDANÇA ---


  return (
    <Link to={`/leitura/${reading.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {imageUrl ? (
            <img src={imageUrl} alt={highlightCard.nome} className={styles.cardImage} />
          ) : (
            <div className={styles.imagePlaceholder}></div>
          )}
          <div className={styles.imageOverlay}></div>
          
          <div className={styles.spreadTypeBadge}>
            {formatSpreadType(reading.spread_type)}
          </div>
        </div>
        
        <div className={styles.content}>
           <div className={styles.authorInfo}>
            <img 
              src={reading.profiles?.avatar_url || 'https://i.imgur.com/6VBx3io.png'} 
              alt={reading.profiles?.username} 
              className={styles.authorAvatar} 
            />
            <span>@{reading.profiles?.username || 'Anônimo'}</span>
          </div>
          <h3 className={styles.title}>{reading.shared_title}</h3>
          {pinnedCommentPreview?.comment_text && (
            <p className={styles.pinnedPreview}>
              ✨ Destaque: {pinnedCommentPreview.comment_text}
            </p>
          )}
          <div className={styles.stats}>
            <span className={styles.statItem}>⭐ {starCount}</span>
            <span className={styles.statItem}>💬 {commentCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ReadingCard;
