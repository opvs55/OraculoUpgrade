// src/components/oracle/GeneratingState.jsx
// Componente para feedback progressivo na geração

import React, { useState, useEffect } from 'react';
import styles from './GeneratingState.module.css';

const GENERATION_STEPS = [
  { id: 1, label: 'Conectando com os oráculos...', duration: 2000 },
  { id: 2, label: 'Analisando padrões energéticos...', duration: 3000 },
  { id: 3, label: 'Sintetizando insights...', duration: 2500 },
  { id: 4, label: 'Gerando orientação prática...', duration: 2000 },
  { id: 5, label: 'Finalizando sua síntese...', duration: 1500 }
];

function Step({ step, isActive, isCompleted }) {
  return (
    <div className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.stepNumber}>
        {isCompleted ? '✓' : step.id}
      </div>
      <div className={styles.stepContent}>
        <h4>{step.label}</h4>
        <div className={styles.stepProgress}>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${isActive ? styles.animating : ''}`} 
              style={{ 
                width: isActive ? '100%' : isCompleted ? '100%' : '0%',
                transitionDuration: isActive ? `${step.duration}ms` : '0ms'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span className={styles.dots}>{dots}</span>;
}

export default function GeneratingState({ message = 'Canalizando sua síntese integrada' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    let stepTimer;
    let progressTimer;
    let currentStepIndex = 0;
    
    const advanceStep = () => {
      currentStepIndex++;
      if (currentStepIndex < GENERATION_STEPS.length) {
        setCurrentStep(GENERATION_STEPS[currentStepIndex].id);
        startStepProgress();
      }
    };
    
    const startStepProgress = () => {
      const step = GENERATION_STEPS[currentStepIndex];
      if (!step) return;
      
      let progress = 0;
      const progressInterval = 20; // Update every 20ms
      const increment = (100 / (step.duration / progressInterval));
      
      progressTimer = setInterval(() => {
        progress += increment;
        setTotalProgress(Math.min(100, (currentStepIndex * 20) + progress));
        
        if (progress >= 100) {
          clearInterval(progressTimer);
          stepTimer = setTimeout(advanceStep, 300); // Small delay between steps
        }
      }, progressInterval);
    };
    
    // Start first step
    startStepProgress();
    
    return () => {
      if (stepTimer) clearTimeout(stepTimer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className={styles.generatingContainer}>
      <div className={styles.header}>
        <div className={styles.icon}>🔮</div>
        <h2>{message}</h2>
        <LoadingDots />
      </div>
      
      <div className={styles.stepsContainer}>
        {GENERATION_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <Step 
              key={step.id}
              step={step}
              isActive={isActive}
              isCompleted={isCompleted}
            />
          );
        })}
      </div>
      
      <div className={styles.overallProgress}>
        <div className={styles.progressInfo}>
          <span>Progresso Total</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${totalProgress}%` }} 
          />
        </div>
      </div>
      
      <div className={styles.tip}>
        <div className={styles.tipIcon}>💫</div>
        <p>
          Enquanto canalizamos, respire fundo e concentre-se na sua intenção. 
          A conexão energética fortalece a precisão da sua leitura.
        </p>
      </div>
    </div>
  );
}
