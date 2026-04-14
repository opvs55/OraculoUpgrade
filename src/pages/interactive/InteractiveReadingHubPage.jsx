import React from 'react';
import { Link } from 'react-router-dom';
import styles from './InteractiveReadingHubPage.module.css';

export default function InteractiveReadingHubPage() {
  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Leituras Interativas</p>
        <h1>Ler para outra pessoa</h1>
        <p>
          Fluxo ao vivo para conexão entre leitor e consulente: fila, sessão, encerramento consensual e
          histórico compartilhável.
        </p>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Entrar na fila</h2>
          <p>Escolha se você quer ler, ser lido ou os dois. Assim que houver match, abrimos sua sessão.</p>
          <Link to="/leituras-interativas/fila">Abrir fila</Link>
        </article>

        <article className={styles.card}>
          <h2>Sessão ao vivo</h2>
          <p>Chat em tempo real, tirar cartas e assistência de IA opcional com transparência.</p>
          <p className={styles.helperText}>Entre pela fila para receber um sessionId e iniciar a sessão ao vivo.</p>
          <Link to="/leituras-interativas/fila">Ir para fila</Link>
        </article>

        <article className={styles.card}>
          <h2>Encerramento</h2>
          <p>Finalização consensual dos dois lados antes da sessão ser fechada no histórico.</p>
          <p className={styles.helperText}>O encerramento é feito dentro da sessão ativa.</p>
          <Link to="/leituras-interativas/fila">Preparar sessão</Link>
        </article>

        <article className={styles.card}>
          <h2>Histórico compartilhável</h2>
          <p>Visualize sessões encerradas e gere link público externo para redes sociais.</p>
          <Link to="/leituras-interativas/historico">Abrir histórico</Link>
        </article>
      </section>
    </div>
  );
}
