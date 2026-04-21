// src/pages/WelcomePageNew.jsx
// Página principal inspirada no design do ChatGPT

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { baralhoDetalhado } from '../tarotDeck.js';
import styles from './WelcomePageNew.module.css';

const oracles = [
  {
    id: 'tarot',
    title: 'Tarot',
    description: 'Leitura simbólica profunda com 78 cartas antigas',
    icon: 'tarot',
    cardImage: '/assets/cartas/RWS1909_-_00_Fool.jpeg',
    to: '/tarot',
    color: '#c36e97'
  },
  {
    id: 'numerologia',
    title: 'Numerologia',
    description: 'Descubra os números que governam sua jornada',
    icon: 'numerology',
    cardImage: '/assets/cartas/RWS1909_-_21_World.jpeg',
    to: '/numerologia',
    color: '#e1b382'
  },
  {
    id: 'runas',
    title: 'Runas',
    description: 'Sabedoria ancestral das pedras mágicas',
    icon: 'runes',
    cardImage: '/assets/cartas/RWS1909_-_01_Magician.jpeg',
    to: '/runas',
    color: '#4a90e2'
  },
  {
    id: 'iching',
    title: 'I Ching',
    description: 'Os 64 hexagramas do livro das mutações',
    icon: 'iching',
    cardImage: '/assets/cartas/RWS1909_-_10_Wheel_of_Fortune.jpeg',
    to: '/iching',
    color: '#7b68ee'
  }
];

const floatingCards = [
  { id: 1, image: '/assets/cartas/RWS1909_-_07_Chariot.jpeg', delay: 0 },
  { id: 2, image: '/assets/cartas/RWS1909_-_17_Star.jpeg', delay: 2 },
  { id: 3, image: '/assets/cartas/RWS1909_-_13_Death.jpeg', delay: 4 },
  { id: 4, image: '/assets/cartas/RWS1909_-_19_Sun.jpeg', delay: 6 },
  { id: 5, image: '/assets/cartas/RWS1909_-_06_Lovers.jpeg', delay: 8 }
];

function WelcomePageNew() {
  const [mounted, setMounted] = useState(false);
  const [hoveredOracle, setHoveredOracle] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * baralhoDetalhado.length);
    return baralhoDetalhado[randomIndex];
  };

  return (
    <div className={styles.welcomeContainer}>
      {/* Background com imagem e overlay */}
      <div className={styles.backgroundLayer}>
        <div className={styles.backgroundImage} />
        <div className={styles.backgroundOverlay} />
      </div>

      {/* Cartas flutuantes animadas */}
      <div className={styles.floatingCards}>
        {floatingCards.map((card) => (
          <div
            key={card.id}
            className={styles.floatingCard}
            style={{
              backgroundImage: `url(${card.image})`,
              animationDelay: `${card.delay}s`
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.titleContainer}>
              <h1 className={styles.mainTitle}>
                <span className={styles.titlePart1}>ESOTERI</span>
                <span className={styles.titlePart2}>CON</span>
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
                onMouseEnter={() => setHoveredOracle(oracle.id)}
                onMouseLeave={() => setHoveredOracle(null)}
              >
                <div className={styles.oracleImage}>
                  <div 
                    className={styles.imageContainer}
                    style={{ backgroundImage: `url(${oracle.cardImage})` }}
                  />
                  <div className={styles.imageOverlay} />
                </div>
                
                <div className={styles.oracleContent}>
                  <div className={styles.oracleHeader}>
                    <h3 className={styles.oracleTitle}>{oracle.title}</h3>
                    <div 
                      className={styles.oracleIcon}
                      style={{ backgroundColor: oracle.color }}
                    >
                      {oracle.icon === 'tarot' && '°'}
                      {oracle.icon === 'numerology' && '8'}
                      {oracle.icon === 'runes' && 'R'}
                      {oracle.icon === 'iching' && 'Y'}
                    </div>
                  </div>
                  
                  <p className={styles.oracleDescription}>{oracle.description}</p>
                  
                  <div className={styles.oracleFooter}>
                    <span className={styles.oracleCTA}>
                      {hoveredOracle === oracle.id ? 'Começar agora' : 'Explorar'}
                    </span>
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

export default WelcomePageNew;
