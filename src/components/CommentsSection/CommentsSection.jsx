// src/components/CommentsSection/CommentsSection.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useReadingComments } from '../../hooks/useReadingComments';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import Loader from '../common/Loader/Loader';
import Modal from '../common/Modal/Modal';
import styles from './CommentsSection.module.css';

// --- SUB-COMPONENTE: Formulário de Comentário Dinâmico ---
function CommentForm({ readingId, parentCommentId = null, onCommentPosted = () => {}, isReplyForm = false }) {
  const { user, profile } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isActive, setIsActive] = useState(isReplyForm); // Formulários de resposta já começam ativos

  const { addComment, isAddingComment } = useReadingComments(readingId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    addComment(
      { commentText, userId: user.id, parentCommentId },
      { onSuccess: () => {
          setCommentText('');
          setIsActive(false);
          onCommentPosted();
      }}
    );
  };

  const handleCancel = () => {
    setCommentText('');
    setIsActive(false);
    onCommentPosted(); // Para fechar forms de resposta
  };
  
  if (!user) {
    if (isReplyForm) return null;
    return (
      <p className={styles.loginPrompt}>
        Você precisa <Link to="/login">fazer login</Link> para deixar um comentário.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.commentFormContainer}>
      <div className={styles.commentForm}>
        <img 
          src={profile?.avatar_url || 'https://i.imgur.com/6VBx3io.png'} 
          alt="Seu avatar" 
          className={styles.avatar} 
        />
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={() => setIsActive(true)}
          placeholder={parentCommentId ? "Escreva sua resposta..." : "Adicionar um comentário..."}
          className={styles.commentTextarea}
          disabled={isAddingComment}
          rows={isActive ? 3 : 1} // Expande ao focar
        />
      </div>
      {isActive && (
        <div className={styles.commentFormActions}>
          <button type="button" className={styles.cancelButton} onClick={handleCancel}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isAddingComment || !commentText.trim()}
          >
            {isAddingComment ? 'Enviando...' : (isReplyForm ? 'Responder' : 'Comentar')}
          </button>
        </div>
      )}
    </form>
  );
}


// --- SUB-COMPONENTE: Item de Comentário --- (com pequenas alterações)
function CommentItem({
  comment,
  readingId,
  isReply = false,
  deleteComment,
  isDeletingComment,
  currentUserId,
  canPin,
  isPinned,
  onTogglePin,
  isTogglingPin
}) {
  const [isReplying, setIsReplying] = useState(false);
  
  const profile = comment.profiles;
  const avatarUrl = profile?.avatar_url || 'https://i.imgur.com/6VBx3io.png';
  const username = profile?.username || 'Anônimo';
  const isOwner = currentUserId === comment.user_id;

  const handleDelete = () => {
    if (isOwner && window.confirm("Tem certeza que quer apagar este comentário?")) {
      deleteComment({ commentId: comment.id, userId: currentUserId });
    }
  };

  return (
    <div className={`${styles.commentItem} ${isReply ? styles.replyItem : ''}`}>
      <img src={avatarUrl} alt={`Avatar de ${username}`} className={styles.avatar} />
      <div className={styles.commentContent}>
        <div className={styles.commentHeader}>
          <Link to={`/perfil/${username}`} className={styles.username}>@{username}</Link>
          <span className={styles.date}>{new Date(comment.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        <p className={styles.commentBody}>{comment.comment_text}</p>
        <div className={styles.commentActions}>
          {!isReply && currentUserId && (
            <button onClick={() => setIsReplying(!isReplying)} className={styles.replyButton} disabled={isDeletingComment}>
              {isReplying ? 'Cancelar' : 'Responder'}
            </button>
          )}
          {isOwner && (
            <button onClick={handleDelete} className={styles.deleteButton} disabled={isDeletingComment}>
              {isDeletingComment ? 'Apagando...' : 'Apagar'}
            </button>
          )}
          {!isReply && canPin && (
            <button onClick={() => onTogglePin(comment.id)} className={styles.pinButton} disabled={isTogglingPin}>
              {isPinned ? 'Remover destaque' : 'Fixar como destaque'}
            </button>
          )}
        </div>
        {isReplying && (
          <CommentForm
            readingId={readingId}
            parentCommentId={comment.id}
            onCommentPosted={() => setIsReplying(false)}
            isReplyForm={true}
          />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.repliesContainer}>
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} readingId={readingId} isReply={true} deleteComment={deleteComment} isDeletingComment={isDeletingComment} currentUserId={currentUserId}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// --- COMPONENTE PRINCIPAL --- (com a nova estrutura)
function CommentsSection({ readingId, isOwner = false, pinnedCommentId = null, reading }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState({ column: 'created_at', ascending: false }); // Padrão: Mais Recentes
  const [isInterpretModalOpen, setIsInterpretModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('Conselho');
  const [interpretationText, setInterpretationText] = useState('');
  
  const {
    commentsPages, totalCommentsCount, isLoadingComments, deleteComment, isDeletingComment,
    pinnedComment, isLoadingPinnedComment,
    addComment, isAddingComment,
    fetchNextPage, hasNextPage, isFetchingNextPage
  } = useReadingComments(readingId, sortBy, pinnedCommentId);

  const positionOptions = Array.isArray(reading?.cards_data)
    ? Array.from(new Set(reading.cards_data.map(card => card?.posicao).filter(Boolean)))
    : [];
  const fallbackOptions = ['Desafio', 'Conselho', 'Resultado'];
  const finalPositionOptions = positionOptions.length > 0 ? positionOptions : fallbackOptions;

  const handleOpenInterpretModal = () => {
    setSelectedPosition(finalPositionOptions[0] || 'Conselho');
    setInterpretationText('');
    setIsInterpretModalOpen(true);
  };

  const handleSubmitPositionInterpretation = (e) => {
    e.preventDefault();
    if (!user || !interpretationText.trim()) return;
    const prefixedText = `[Posição: ${selectedPosition}] ${interpretationText.trim()}`;
    addComment(
      { commentText: prefixedText, userId: user.id, parentCommentId: null },
      {
        onSuccess: () => {
          setInterpretationText('');
          setIsInterpretModalOpen(false);
        }
      }
    );
  };

  const togglePinnedMutation = useMutation({
    mutationFn: async (commentId) => {
      if (!reading || !user || !isOwner) {
        throw new Error('Sem permissão para fixar comentário.');
      }

      const currentInterpretationData = typeof reading.interpretation_data === 'object' && reading.interpretation_data !== null
        ? reading.interpretation_data
        : {};
      const currentPinnedId = currentInterpretationData?.pinned_comment_id || null;
      const nextPinnedId = currentPinnedId === commentId ? null : commentId;
      const nextInterpretationData = {
        ...currentInterpretationData,
        pinned_comment_id: nextPinnedId,
      };

      const { error } = await supabase
        .from('readings')
        .update({ interpretation_data: nextInterpretationData })
        .eq('id', readingId)
        .eq('user_id', user.id);

      if (error) throw error;
      return nextInterpretationData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings', 'detail', readingId] });
    },
  });

  const pinnedCommentToRender = pinnedComment && pinnedComment.parent_comment_id ? null : pinnedComment;

  return (
    <div className={styles.commentsWrapper}>
      <div className={styles.mainHeader}>
        <h3 className={styles.title}>
          Comentários ({isLoadingComments ? '...' : totalCommentsCount})
        </h3>
        <div className={styles.sortControls}>
          <button 
            onClick={() => setSortBy({ column: 'created_at', ascending: false })}
            className={`${styles.sortButton} ${sortBy.ascending === false ? styles.active : ''}`}
          >
            Mais Recentes
          </button>
          {/* Adicionar ordenação por "populares" no futuro aqui */}
        </div>
      </div>

      <CommentForm readingId={readingId} />
      {user && (
        <button
          type="button"
          onClick={handleOpenInterpretModal}
          className={styles.interpretPositionButton}
        >
          Interpretar uma posição
        </button>
      )}

      {isLoadingComments && <Loader customText="Carregando comentários..." />}
      {isLoadingPinnedComment && <Loader customText="Buscando comentário em destaque..." />}

      {!isLoadingComments && totalCommentsCount === 0 && (
        <p className={styles.noComments}>Ainda não há comentários. Seja o primeiro a dizer algo!</p>
      )}

      {pinnedCommentToRender && (
        <div className={styles.pinnedCommentBlock}>
          <p className={styles.pinnedLabel}>✨ Comentário Destaque</p>
          <CommentItem
            comment={pinnedCommentToRender}
            readingId={readingId}
            deleteComment={deleteComment}
            isDeletingComment={isDeletingComment}
            currentUserId={user?.id}
            canPin={isOwner}
            isPinned={true}
            onTogglePin={togglePinnedMutation.mutate}
            isTogglingPin={togglePinnedMutation.isPending}
          />
        </div>
      )}

      <div className={styles.commentsList}>
        {commentsPages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data
              .filter(comment => comment.id !== pinnedCommentToRender?.id)
              .map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                readingId={readingId}
                deleteComment={deleteComment}
                isDeletingComment={isDeletingComment}
                currentUserId={user?.id}
                canPin={isOwner}
                isPinned={comment.id === pinnedCommentToRender?.id}
                onTogglePin={togglePinnedMutation.mutate}
                isTogglingPin={togglePinnedMutation.isPending}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {hasNextPage && (
        <div className={styles.loadMoreContainer}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className={styles.loadMoreButton}
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar Mais Comentários'}
          </button>
        </div>
      )}

      <Modal
        isOpen={isInterpretModalOpen}
        onClose={() => !isAddingComment && setIsInterpretModalOpen(false)}
        title="Interpretar uma posição"
      >
        <form onSubmit={handleSubmitPositionInterpretation} className={styles.interpretForm}>
          <label className={styles.interpretLabel}>
            Posição
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className={styles.positionSelect}
              disabled={isAddingComment}
            >
              {finalPositionOptions.map((position) => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </label>

          <label className={styles.interpretLabel}>
            Sua leitura
            <textarea
              value={interpretationText}
              onChange={(e) => setInterpretationText(e.target.value)}
              placeholder="Compartilhe sua interpretação dessa posição..."
              rows={4}
              required
              disabled={isAddingComment}
              className={styles.interpretTextarea}
            />
          </label>

          <p className={styles.interpretHint}>Seu comentário será publicado como: [Posição: {selectedPosition}] ...</p>

          <div className={styles.interpretActions}>
            <button type="button" onClick={() => setIsInterpretModalOpen(false)} className={styles.cancelButton} disabled={isAddingComment}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton} disabled={isAddingComment || !interpretationText.trim()}>
              {isAddingComment ? 'Publicando...' : 'Publicar interpretação'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CommentsSection;
