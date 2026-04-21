// src/pages/WelcomePageFixed.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomePageFixed.module.css';

const features = [
  {
    id: 'tarot',
    icon: '✦',
    title: 'Tarot com IA',
    description: 'Cruz Celta, Três Cartas e outras tiragens com interpretações geradas por inteligência artificial.',
  },
  {
    id: 'oraculos',
    icon: '◎',
    title: 'Runas & I Ching',
    description: 'Leituras semanais de Runas do Futhark Antigo e hexagramas do I Ching, integradas à sua semana.',
  },
  {
    id: 'sintese',
    icon: '◉',
    title: 'Síntese Integrada',
    description: 'IA que cruza Tarot, Runas, I Ching e Numerologia numa leitura unificada da sua semana.',
  },
  {
    id: 'privado',
    icon: '⊕',
    title: 'Seguro e Privado',
    description: 'Histórico completo das suas leituras salvo com segurança. Sua jornada, só sua.',
  },
];

function WelcomePageFixed() {
  return (
    <div className={styles.welcomeContainer}>
      {/* Fundo: imagem + overlay escuro */}
      <div className={styles.bgImage} aria-hidden="true" />
      <div className={styles.bgOverlay} aria-hidden="true" />

      {/* HERO */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          O QUE ESTÁ OCULTO QUER SER VISTO
          <span className={styles.eyebrowLine} />
        </p>

        <h1 className={styles.mainTitle}>ESOTERICON</h1>

        <div className={styles.titleDeco} aria-hidden="true">
          <span className={styles.decoLine} />
          <span className={styles.decoMoon}>☽</span>
          <span className={styles.decoLine} />
        </div>

        <p className={styles.subtitle}>
          Descubra respostas com leituras guiadas e conteúdo esotérico curado para sua jornada espiritual.
        </p>
        <p className={styles.subtitleSecondary}>
          Cada leitura é um convite ao silêncio interno, para ouvir símbolos,
          perceber padrões e transformar perguntas em direção.
        </p>

        <div className={styles.ctaWrapper}>
          <Link to="/cadastro" className={styles.primaryButton}>
            CRIAR CONTA GRÁTIS ✦
          </Link>
          <Link to="/login" className={styles.secondaryButton}>
            Já tenho conta
          </Link>
        </div>
        <Link to="/tarot" className={styles.tryLink}>
          Ou experimente sem conta →
        </Link>

        <div className={styles.trustRow}>
          <span>+2.000 leituras realizadas</span>
          <span className={styles.trustDot}>•</span>
          <span>Privacidade garantida</span>
          <span className={styles.trustDot}>•</span>
          <span>Resposta imediata</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.id} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <footer className={styles.quoteBar}>
        <span className={styles.quoteSymbol}>✦</span>
        <p className={styles.quoteText}>
          "A resposta que você busca já existe dentro de você. O tarot apenas te ajuda a ouvir."
        </p>
        <span className={styles.quoteSymbol}>✦</span>
      </footer>
    </div>
  );
}

export default WelcomePageFixed;
