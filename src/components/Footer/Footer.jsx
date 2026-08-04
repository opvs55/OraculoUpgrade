import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>ESOTERICON</span>
          <p className={styles.tagline}>Leituras místicas e conhecimento ancestral com elegância.</p>
        </div>

        <nav className={styles.links} aria-label="Links do rodapé">
          <span className={styles.linksLabel}>Explorar</span>
          <Link to="/tarot">Fazer leitura</Link>
          <Link to="/oraculo/dia">Carta do Dia</Link>
          <Link to="/biblioteca">Biblioteca</Link>
          <Link to="/historico">Histórico</Link>
        </nav>
      </div>

      <div className={styles.metaBar}>
        <span>© {new Date().getFullYear()} Esotericon</span>
        <span>Privacidade e cuidado em cada leitura.</span>
      </div>
    </footer>
  );
}

export default Footer;
