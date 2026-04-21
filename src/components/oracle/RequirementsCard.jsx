// src/components/oracle/RequirementsCard.jsx
// Componente visual para requisitos da leitura unificada

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './RequirementsCard.module.css';

const MODULE_CONFIG = {
  has_weekly_card: {
    title: 'Tarot Semanal',
    description: 'Carta guia da semana',
    icon: '🃏',
    action: '/tarot',
    cta: 'Fazer Leitura'
  },
  has_numerology_weekly: {
    title: 'Numerologia Semanal',
    description: 'Análise numerológica',
    icon: '🔢',
    action: '/numerologia',
    cta: 'Calcular Números'
  },
  has_runes_weekly: {
    title: 'Runas Semanais',
    description: 'Conselho das runas',
    icon: '🪨',
    action: '/runas',
    cta: 'Lançar Runas'
  },
  has_iching_weekly: {
    title: 'I Ching Semanal',
    description: 'Sabedoria do I Ching',
    icon: '☯',
    action: '/iching',
    cta: 'Consultar I Ching'
  }
};

function ModuleCard({ moduleKey, isCompleted, isRequired = true }) {
  const config = MODULE_CONFIG[moduleKey];
  if (!config) return null;

  return (
    <div className={`${styles.moduleCard} ${isCompleted ? styles.completed : styles.pending}`}>
      <div className={styles.moduleIcon}>{config.icon}</div>
      <div className={styles.moduleInfo}>
        <h4>{config.title}</h4>
        <p>{config.description}</p>
      </div>
      <div className={styles.moduleStatus}>
        {isCompleted ? (
          <span className={styles.completedBadge}>✓ Completo</span>
        ) : (
          <Link to={config.action} className={styles.actionButton}>
            {config.cta}
          </Link>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ current, total, label }) {
  const percentage = Math.min(100, (current / total) * 100);
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressInfo}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressCount}>{current}/{total}</span>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function RequirementsCard({ requirements, missingChecklist }) {
  if (!requirements || requirements.can_generate_general_reading) {
    return null;
  }

  // Contador de módulos completos
  const completedCount = Object.entries(requirements)
    .filter(([key, value]) => key.startsWith('has_') && value === true)
    .length;

  const totalModules = Object.keys(MODULE_CONFIG).length;
  const isReady = completedCount >= 2; // Mínimo 2 módulos

  return (
    <section className={styles.requirementsCard}>
      <div className={styles.requirementsHeader}>
        <h2>📋 Complete 2 oráculos para desbloquear</h2>
        <p>
          Combine diferentes tradições para receber uma síntese integrada poderosa e personalizada.
        </p>
      </div>

      <ProgressBar 
        current={completedCount}
        total={totalModules}
        label="Módulos Completos"
      />

      <div className={styles.modulesGrid}>
        {Object.entries(MODULE_CONFIG).map(([moduleKey, config]) => {
          const isCompleted = requirements[moduleKey] === true;
          const isPriority = ['has_weekly_card', 'has_numerology_weekly'].includes(moduleKey);
          
          return (
            <ModuleCard
              key={moduleKey}
              moduleKey={moduleKey}
              isCompleted={isCompleted}
              isRequired={isPriority}
            />
          );
        })}
      </div>

      {isReady && (
        <div className={styles.readyMessage}>
          <div className={styles.readyIcon}>🎉</div>
          <div className={styles.readyText}>
            <h3>Parabéns! Você está pronto</h3>
            <p>
              Você completou {completedCount} oráculos. Agora pode gerar sua primeira Síntese Integrada!
            </p>
          </div>
        </div>
      )}

      {!isReady && (
        <div className={styles.tipBox}>
          <div className={styles.tipIcon}>💡</div>
          <div className={styles.tipText}>
            <h4>Dica Rápida</h4>
            <p>
              Comece com Tarot e Numerologia - são os mais rápidos de completar e fornecem uma base sólida para sua síntese.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
