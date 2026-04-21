// src/components/oracle/ErrorState.jsx
// Componente para estados de erro amigáveis

import React from 'react';
import styles from './ErrorState.module.css';

const ERROR_TYPES = {
  NETWORK: {
    icon: '🌐',
    title: 'Problema de Conexão',
    message: 'Não conseguimos conectar com os servidores. Verifique sua internet e tente novamente.',
    actions: ['Tentar Novamente', 'Verificar Conexão']
  },
  SERVICE_UNAVAILABLE: {
    icon: '🔧',
    title: 'Serviço Indisponível',
    message: 'Nossos oráculos estão em manutenção momentânea. Volte em alguns minutos.',
    actions: ['Verificar Status', 'Usar Modo Offline']
  },
  REQUIREMENTS_MISSING: {
    icon: '📋',
    title: 'Requisitos Pendentes',
    message: 'Complete algumas leituras semanais para desbloquear esta funcionalidade.',
    actions: ['Ver Requisitos', 'Fazer Leitura']
  },
  GENERATION_FAILED: {
    icon: '⚡',
    title: 'Falha na Geração',
    message: 'Ocorreu um erro ao gerar sua leitura. Tente novamente com uma pergunta diferente.',
    actions: ['Tentar Novamente', 'Mudar Pergunta']
  },
  GENERIC: {
    icon: '⚠️',
    title: 'Ops! Algo deu errado',
    message: 'Ocorreu um erro inesperado. Nossa equipe já foi notificada.',
    actions: ['Tentar Novamente', 'Contatar Suporte']
  }
};

function ActionButton({ children, onClick, variant = 'primary' }) {
  return (
    <button 
      onClick={onClick}
      className={`${styles.actionButton} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function getErrorType(error, context = {}) {
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('network')) {
    return ERROR_TYPES.NETWORK;
  }
  
  if (error?.message?.includes('service') || error?.message?.includes('unavailable')) {
    return ERROR_TYPES.SERVICE_UNAVAILABLE;
  }
  
  if (context.hasRequirementsMissing) {
    return ERROR_TYPES.REQUIREMENTS_MISSING;
  }
  
  if (context.isGenerationError) {
    return ERROR_TYPES.GENERATION_FAILED;
  }
  
  return ERROR_TYPES.GENERIC;
}

export default function ErrorState({ 
  error, 
  onRetry, 
  onCheckRequirements, 
  onGoToReading,
  context = {} 
}) {
  const errorType = getErrorType(error, context);
  
  const handleAction = (action) => {
    switch (action) {
      case 'Tentar Novamente':
        if (onRetry) onRetry();
        break;
      case 'Verificar Conexão':
        window.open('https://www.google.com', '_blank');
        break;
      case 'Verificar Status':
        window.open('https://status.oraculo-ia.com', '_blank');
        break;
      case 'Usar Modo Offline':
        if (onCheckRequirements) onCheckRequirements();
        break;
      case 'Ver Requisitos':
      case 'Fazer Leitura':
        if (onCheckRequirements) onCheckRequirements();
        break;
      case 'Mudar Pergunta':
        if (onGoToReading) onGoToReading();
        break;
      case 'Contatar Suporte':
        window.open('mailto:suporte@oraculo-ia.com', '_blank');
        break;
      default:
        if (onRetry) onRetry();
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          {errorType.icon}
        </div>
        
        <div className={styles.errorInfo}>
          <h2>{errorType.title}</h2>
          <p>{errorType.message}</p>
          
          {error?.details && (
            <details className={styles.errorDetails}>
              <summary>Detalhes técnicos</summary>
              <pre>{error.details}</pre>
            </details>
          )}
        </div>
        
        <div className={styles.errorActions}>
          {errorType.actions.map((action, index) => (
            <ActionButton
              key={action}
              onClick={() => handleAction(action)}
              variant={index === 0 ? 'primary' : 'secondary'}
            >
              {action}
            </ActionButton>
          ))}
        </div>
      </div>
      
      {/* Dica contextual */}
      <div className={styles.tipBox}>
        <div className={styles.tipIcon}>💡</div>
        <div className={styles.tipContent}>
          <h4>Dica Rápida</h4>
          <p>
            {errorType === ERROR_TYPES.NETWORK && 
              'Verifique se outras páginas estão funcionando. Se sim, limpe o cache do navegador.'}
            {errorType === ERROR_TYPES.SERVICE_UNAVAILABLE && 
              'Nossa equipe já está trabalhando nisso. Tente novamente em 5-10 minutos.'}
            {errorType === ERROR_TYPES.REQUIREMENTS_MISSING && 
              'Comece com Tarot e Numerologia - são os mais rápidos e fornecem ótima base.'}
            {errorType === ERROR_TYPES.GENERATION_FAILED && 
              'Tente reformular sua pergunta com mais clareza e foco.'}
            {errorType === ERROR_TYPES.GENERIC && 
              'Se o problema persistir, entre em contato com nosso suporte.'}
          </p>
        </div>
      </div>
    </div>
  );
}
