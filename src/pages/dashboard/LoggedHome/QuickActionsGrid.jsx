import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../MeuGrimorioPage.module.css';

function QuickActionsGrid() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Ações rápidas</h2>
      <div className={styles.actionsGrid}>
        <article className={`${styles.actionCard} ${styles.actionPrimary}`}>
          <div className={styles.actionIcon}>✨</div>
          <h3>Fazer leitura</h3>
          <p>Abra um novo portal e receba sua mensagem agora.</p>
          <Link to="/tarot" className={styles.actionButtonPrimary}>
            Iniciar leitura
          </Link>
        </article>

        <article className={styles.actionCard}>
          <div className={styles.actionIcon}>🔢</div>
          <h3>Numerologia</h3>
          <p>Explore números que revelam ciclos e padrões pessoais.</p>
          <Link to="/numerologia" className={styles.actionButtonSecondary}>
            Ver numerologia
          </Link>
        </article>

        <article className={styles.actionCard}>
          <div className={styles.actionIcon}>📚</div>
          <h3>Biblioteca</h3>
          <p>Consulte cartas e conteúdos para aprofundar sua jornada.</p>
          <Link to="/biblioteca" className={styles.actionButtonTertiary}>
            Explorar biblioteca
          </Link>
        </article>


        <article className={styles.actionCard}>
          <div className={styles.actionIcon}>ᚠ</div>
          <h3>Runas</h3>
          <p>Ative sua leitura semanal de runas para fortalecer a síntese geral.</p>
          <Link to="/runas" className={styles.actionButtonSecondary}>
            Gerar runas
          </Link>
        </article>

        <article className={styles.actionCard}>
          <div className={styles.actionIcon}>☯️</div>
          <h3>I Ching</h3>
          <p>Consulte o I Ching da semana e complemente seus direcionamentos.</p>
          <Link to="/iching" className={styles.actionButtonSecondary}>
            Gerar I Ching
          </Link>
        </article>
        <article className={styles.actionCard}>
          <div className={styles.actionIcon}>🧭</div>
          <h3>Síntese Semanal</h3>
          <p>Gere uma síntese dos seus oráculos e veja direcionamentos práticos.</p>
          <Link to="/oraculo/geral" className={styles.actionButtonSecondary}>
            Abrir síntese semanal
          </Link>
        </article>
      </div>
    </section>
  );
}

export default QuickActionsGrid;
