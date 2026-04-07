// src/components/ReadingInteractionBar/ReadingInteraction-Bar.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useReadingStars } from '../../hooks/useReadingStars';
import { supabase } from '../../supabaseClient';
import Modal from '../common/Modal/Modal';
import {
  getCurrentIntegratedTags,
  getCurrentRitualTags,
  mergeCommunityTags,
} from '../../utils/communityRitual';

import modalStyles from '../common/Modal/Modal.module.css';
import styles from './ReadingInteractionBar.module.css';

const getPositionOptions = (spreadType, cardsData = []) => {
  const optionsBySpread = {
    threeCards: ['Passado', 'Presente', 'Futuro'],
    celticCross: [
      'Situação Atual',
      'Desafio',
      'Base da Questão',
      'Passado Recente',
      'Objetivo Consciente',
      'Futuro Próximo',
      'Você',
      'Ambiente',
      'Esperanças/Medos',
      'Desfecho'
    ],
    templeOfAphrodite: ['Energia Principal', 'Consulente', 'Outro', 'Conexão', 'Bloqueio', 'Conselho', 'Potencial'],
    pathChoice: ['Caminho 1', 'Caminho 2', 'Conselho Central']
  };

  const spreadOptions = optionsBySpread[spreadType];
  if (Array.isArray(spreadOptions)) return spreadOptions;

  if (Array.isArray(cardsData) && cardsData.length > 0) {
    return cardsData.map((_, index) => `Posição ${index + 1}`);
  }

  return [];
};

function ReadingInteractionBar({ reading, user, isOwner }) {
  const queryClient = useQueryClient();
  const readingId = reading.id;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTitleInput, setShareTitleInput] = useState(reading.shared_title || '');
  const [publishInRitual, setPublishInRitual] = useState(false);
  const [publishAsIntegrated, setPublishAsIntegrated] = useState(false);
  const [requestInterpretation, setRequestInterpretation] = useState(false);
  const [promptPosition, setPromptPosition] = useState('');
  const [shareError, setShareError] = useState('');
  const { tags: ritualTags } = getCurrentRitualTags();
  const { tags: integratedTags } = getCurrentIntegratedTags();
  const positionOptions = getPositionOptions(reading.spread_type, reading.cards_data);

  const {
    totalStars,
    userHasStarred,
    isLoadingStars,
    addStar,
    removeStar,
    isAddingStar,
    isRemovingStar
  } = useReadingStars(readingId, user?.id);

  const isStarLoading = isAddingStar || isRemovingStar;

  const updateReadingMutation = useMutation({
    mutationFn: async ({ updates }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from('readings')
        .update(updates)
        .eq('id', readingId)
        .eq('user_id', user.id)
        .select('is_public, shared_title, tags, interpretation_data')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['readings', 'detail', readingId], (oldData) =>
        oldData ? { ...oldData, ...variables.updates } : oldData
      );
      queryClient.invalidateQueries({ queryKey: ['publicReadings'] });
      
      setIsShareModalOpen(false);
      setShareTitleInput(variables.updates.shared_title || '');
      setPublishInRitual(false);
      setPublishAsIntegrated(false);
      setRequestInterpretation(false);
      setPromptPosition('');
    },
    onError: (error) => {
      console.error("Erro ao atualizar leitura:", error);
      setShareError(`Erro: ${error.message}`);
    }
  });

  const handleTogglePublic = () => {
    if (!isOwner) return;
    const currentlyPublic = reading.is_public;
    if (currentlyPublic) {
      if (window.confirm('Tem certeza que deseja tornar esta leitura privada? Ela não será mais visível na comunidade e o título compartilhado será removido.')) {
        updateReadingMutation.mutate({
          updates: { is_public: false, shared_title: null }
        });
      }
    } else {
      setShareTitleInput(reading.shared_title || '');
      setShareError('');
      setPublishInRitual(false);
      setPublishAsIntegrated(false);
      setRequestInterpretation(false);
      setPromptPosition('');
      setIsShareModalOpen(true);
    }
  };

  const handleConfirmShare = (e) => {
    e.preventDefault();
    if (!shareTitleInput.trim()) {
      setShareError("Por favor, adicione um título ou breve descrição.");
      return;
    }
    setShareError('');


    const baseTags = Array.isArray(reading.tags) ? reading.tags : [];
    const nextTags = mergeCommunityTags(
      baseTags,
      publishInRitual ? ritualTags : [],
      publishAsIntegrated ? integratedTags : [],
    );

    const updates = {
      is_public: true,
      shared_title: shareTitleInput.trim(),
      tags: nextTags,
    };

    if (requestInterpretation) {
      const selectedPosition = promptPosition || 'geral';
      const existingInterpretationData = reading.interpretation_data || {};
      updates.interpretation_data = {
        ...existingInterpretationData,
        community_prompt: {
          position: selectedPosition,
          question: `Interprete a posição ${selectedPosition}.`,
        },
        pinned_comment_id: existingInterpretationData?.pinned_comment_id || null,
      };
    }

    updateReadingMutation.mutate({
      updates
    });
  };

  return (
    <>
      <div className={styles.wrapper}>
        
        {/* --- LADO ESQUERDO: Ações e Info da Comunidade --- */}
        <div className={styles.leftActions}>
          
          {/* Botão de Estrela (só para não-donos logados) */}
          {!isOwner && user && (
            <button
              onClick={() => userHasStarred ? removeStar() : addStar()}
              disabled={isLoadingStars || isStarLoading}
              className={`${styles.starButton} ${userHasStarred ? styles.starred : ''}`}
              title={userHasStarred ? "Remover estrela" : "Dar estrela"}
            >
              ⭐
              <span>
                {isStarLoading 
                  ? '...' 
                  : (userHasStarred ? 'Estrelado' : 'Dar Estrela')}
              </span>
            </button>
          )}

          {/* Contagem de Estrelas (Sempre visível para todos) */}
          <span className={styles.totalStarsCount}>
              {isLoadingStars ? '...' : `${totalStars} ⭐`}
          </span>
        </div>

        
        {/* --- LADO DIREITO: Status e Ações do Dono --- */}
        <div className={styles.rightActions}>
          

          {/* Botão de Gestão de Partilha (SÓ para o Dono) */}
          {isOwner && (
            <>
              <span className={styles.shareStatus}>
                {reading.is_public ? 'Pública 🌍' : 'Privada 🔒'}
              </span>
              {Array.isArray(reading.tags) && reading.tags.includes('integrada') && (
                <span className={styles.integratedStatus}>Leitura integrada</span>
              )}
              <button
                onClick={handleTogglePublic}
                className={styles.shareButton}
                disabled={updateReadingMutation.isPending}
              >
                {updateReadingMutation.isPending ? 'Salvando...' : (reading.is_public ? 'Tornar Privada' : 'Compartilhar')}
              </button>
            </>
          )}

        </div>
      </div>

      {/* O Modal continua a fazer parte deste componente, renderizado fora do fluxo principal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => !updateReadingMutation.isPending && setIsShareModalOpen(false)}
        title="Compartilhar Leitura"
      >
        <form onSubmit={handleConfirmShare}>
          <p>Adicione um título ou breve descrição para compartilhar sua leitura com a comunidade:</p>
          <textarea
            value={shareTitleInput}
            onChange={(e) => setShareTitleInput(e.target.value)}
            placeholder="Ex: Reflexão sobre minha carreira, Conselho que recebi hoje..."
            rows="4"
            maxLength={200}
            required
            disabled={updateReadingMutation.isPending}
            className={modalStyles.textarea}
          />
          {shareError && <p className={modalStyles.error}>{shareError}</p>}
          <label className={modalStyles.checkboxRow}>
            <input
              type="checkbox"
              checked={publishInRitual}
              onChange={(e) => setPublishInRitual(e.target.checked)}
              disabled={updateReadingMutation.isPending}
            />
            Publicar no Ritual da Semana (adiciona tags automáticas).
          </label>

          <label className={modalStyles.checkboxRow}>
            <input
              type="checkbox"
              checked={publishAsIntegrated}
              onChange={(e) => setPublishAsIntegrated(e.target.checked)}
              disabled={updateReadingMutation.isPending}
            />
            Marcar como Leitura Integrada da Semana.
          </label>

          {publishAsIntegrated && (
            <p className={styles.integratedHint}>
              Dica: combine os 4 oráculos para uma leitura mais profunda em{' '}
              <Link to="/oraculo/geral" className={styles.inlineLink}>
                Leitura Geral
              </Link>
              .
            </p>
          )}

          <label className={modalStyles.checkboxRow}>
            <input
              type="checkbox"
              checked={requestInterpretation}
              onChange={(e) => setRequestInterpretation(e.target.checked)}
              disabled={updateReadingMutation.isPending}
            />
            Pedir interpretação da posição.
          </label>

          {requestInterpretation && (
            <div className={styles.promptFields}>
              <label className={styles.fieldLabel}>
                Posição (opcional)
                <select
                  value={promptPosition}
                  onChange={(e) => setPromptPosition(e.target.value)}
                  disabled={updateReadingMutation.isPending}
                  className={styles.promptSelect}
                >
                  <option value="">Sem posição específica</option>
                  {positionOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className={modalStyles.modalActions}>
            <button
              type="button"
              className={modalStyles.cancelButton}
              onClick={() => setIsShareModalOpen(false)}
              disabled={updateReadingMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={modalStyles.confirmButton}
              disabled={updateReadingMutation.isPending}
            >
              {updateReadingMutation.isPending ? 'Compartilhando...' : 'Confirmar e Compartilhar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ReadingInteractionBar;
