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

        <nav className={styles.links} aria-label="Oráculos">
          <span className={styles.linksLabel}>Oráculos</span>
          <Link to="/tarot">Tarot</Link>
          <Link to="/runas">Runas Semanais</Link>
          <Link to="/iching">I Ching Semanal</Link>
          <Link to="/numerologia">Numerologia</Link>
          <Link to="/oraculo/geral">Síntese Integrada</Link>
        </nav>

        <nav className={styles.links} aria-label="Conta">
          <span className={styles.linksLabel}>Conta</span>
          <Link to="/biblioteca">Biblioteca</Link>
          <Link to="/historico">Histórico</Link>
          <Link to="/perfil">Meu Perfil</Link>
        </nav>

        <div className={styles.meta}>
          <span>© {new Date().getFullYear()} Esotericon</span>
          <span>Privacidade e cuidado em cada leitura.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
