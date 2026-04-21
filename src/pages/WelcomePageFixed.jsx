// src/pages/WelcomePageFixed.jsx
// Página principal inspirada no design do ChatGPT - Versão Corrigida

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomePageFixed.module.css';

const oracles = [
  {
    id: 'tarot',
    title: 'Tarot',
    description: 'Leitura simbólica profunda com 78 cartas antigas',
    icon: '🃏',
    to: '/tarot',
    color: '#c36e97'
  },
  {
    id: 'numerologia',
    title: 'Numerologia',
    description: 'Descubra os números que governam sua jornada',
    icon: '🔢',
    to: '/numerologia',
    color: '#e1b382'
  },
  {
    id: 'runas',
    title: 'Runas',
    description: 'Sabedoria ancestral das pedras mágicas',
    icon: '🪨',
    to: '/runas',
    color: '#4a90e2'
  },
  {
    id: 'iching',
    title: 'I Ching',
    description: 'Os 64 hexagramas do livro das mutações',
    icon: '☯',
    to: '/iching',
    color: '#7b68ee'
  }
];

function WelcomePageFixed() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.welcomeContainer}>
      {/* Background com imagem e overlay */}
      <div className={styles.backgroundLayer}>
        <div className={styles.backgroundImage} />
        <div className={styles.backgroundOverlay} />
      </div>

      {/* Conteúdo principal */}
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.titleContainer}>
              <h1 className={styles.mainTitle}>
                ESOTERICON
              </h1>
              <div className={styles.titleDecoration}>
                <span className={styles.decorationLine} />
                <span className={styles.decorationSymbol}>°</span>
                <span className={styles.decorationLine} />
              </div>
            </div>

            <p className={styles.subtitle}>
              Descubra respostas profundas através de leituras guiadas e sabedoria esotérica 
              curada para sua jornada espiritual única.
            </p>

            <div className={styles.mainCTA}>
              <Link to="/tarot" className={styles.primaryButton}>
                <span className={styles.buttonText}>Iniciar minha jornada</span>
                <span className={styles.buttonArrow}>»</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Oráculos Section */}
        <section className={styles.oraclesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Escolha seu Oráculo</h2>
            <p className={styles.sectionSubtitle}>
              Cada tradição oferece uma porta diferente para o autoconhecimento
            </p>
          </div>

          <div className={styles.oraclesGrid}>
            {oracles.map((oracle) => (
              <Link
                key={oracle.id}
                to={oracle.to}
                className={styles.oracleCard}
                style={{ '--oracle-color': oracle.color }}
              >
                <div className={styles.oracleIcon}>
                  <span>{oracle.icon}</span>
                </div>
                
                <div className={styles.oracleContent}>
                  <div className={styles.oracleHeader}>
                    <h3 className={styles.oracleTitle}>{oracle.title}</h3>
                  </div>
                  
                  <p className={styles.oracleDescription}>{oracle.description}</p>
                  
                  <div className={styles.oracleFooter}>
                    <span className={styles.oracleCTA}>Explorar</span>
                    <span className={styles.oracleArrow}>»</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust Signals */}
        <section className={styles.trustSection}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>°</div>
              <div className={styles.trustContent}>
                <h4>+2.000 Leituras</h4>
                <p>Realizadas com sucesso</p>
              </div>
            </div>
            
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>°</div>
              <div className={styles.trustContent}>
                <h4>Privacidade Total</h4>
                <p>Seus dados estão seguros</p>
              </div>
            </div>
            
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>°</div>
              <div className={styles.trustContent}>
                <h4>Resposta Imediata</h4>
                <p>Sem filas ou esperas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mystical Footer */}
        <section className={styles.mysticalSection}>
          <div className={styles.mysticalContent}>
            <p className={styles.mysticalText}>
              "A sabedoria não está nas respostas, mas na coragem de fazer as perguntas certas"
            </p>
            <div className={styles.mysticalDecoration}>
              <span className={styles.mysticalSymbol}>°</span>
              <span className={styles.mysticalLine} />
              <span className={styles.mysticalSymbol}>°</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default WelcomePageFixed;
