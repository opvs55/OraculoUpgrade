import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <span className={styles.symbol}>☽</span>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Caminho não encontrado</h2>
        <p className={styles.desc}>
          Este portal não existe — ou talvez ainda não seja o momento de acessá-lo.
          Retorne ao início e consulte os oráculos pelo caminho correto.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.primary}>Voltar ao início</Link>
          <Link to="/tarot" className={styles.secondary}>Fazer uma leitura</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
