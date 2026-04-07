import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { baralhoDetalhado } from '../../tarotDeck';
import CardPreview from '../../components/CardPreview/CardPreview';
import styles from './CardLibraryPage.module.css';

const oracleTracks = [
  {
    title: 'Runas',
    description: 'Estude símbolos nórdicos, polaridades e temas da semana com leitura ritual.',
    to: '/runas',
    cta: 'Abrir Runas',
  },
  {
    title: 'Numerologia',
    description: 'Entenda caminho de vida, arquétipo do nascimento e padrões pessoais.',
    to: '/numerologia',
    cta: 'Abrir Numerologia',
  },
  {
    title: 'I Ching',
    description: 'Aprofunde decisões com hexagramas, linhas mutantes e estratégia.',
    to: '/iching',
    cta: 'Abrir I Ching',
  },
];

function CardLibraryPage() {
  const [activeTab, setActiveTab] = useState('maiores');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [copiedCardId, setCopiedCardId] = useState(null);

  const tabs = useMemo(() => ({
    maiores: {
      title: "Arcanos Maiores",
      cards: baralhoDetalhado.filter(carta => carta.tipo === 'Arcano Maior')
    },
    paus: {
      title: "Naipe de Paus",
      cards: baralhoDetalhado.filter(carta => carta.naipe === 'Paus')
    },
    copas: {
      title: "Naipe de Copas",
      cards: baralhoDetalhado.filter(carta => carta.naipe === 'Copas')
    },
    espadas: {
      title: "Naipe de Espadas",
      cards: baralhoDetalhado.filter(carta => carta.naipe === 'Espadas')
    },
    ouros: {
      title: "Naipe de Ouros",
      cards: baralhoDetalhado.filter(carta => carta.naipe === 'Ouros')
    }
  }), []);

  const selectedCard = useMemo(
    () => baralhoDetalhado.find((card) => card.id === selectedCardId) || null,
    [selectedCardId],
  );

  const handleShareCard = async (card) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/biblioteca/${card.slug}`;
    const shareText = [
      `Estou estudando a carta "${card.nome}" no Grimório da Bruxa.`,
      `Estudo completo: ${shareUrl}`,
      'Debate sobre interpretação: /comunidade/forum',
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        throw new Error('clipboard_not_supported');
      }
      setCopiedCardId(card.id);
      window.setTimeout(() => setCopiedCardId((prev) => (prev === card.id ? null : prev)), 1800);
    } catch (error) {
      console.error('Falha ao copiar texto da carta:', error);
      window.alert('Não foi possível copiar automaticamente. Tente novamente.');
    }
  };

  const renderCardSection = (title, cards) => (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.cardGrid}>
        {cards.map(card => (
          <article key={card.id} className={styles.cardItem}>
            <CardPreview card={card} />
            <div className={styles.cardActions}>
              <button
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={selectedCardId === card.id ? styles.selected : ''}
              >
                {selectedCardId === card.id ? 'Selecionada' : 'Selecionar carta'}
              </button>
              <button type="button" onClick={() => handleShareCard(card)}>
                {copiedCardId === card.id ? 'Copiado!' : 'Compartilhar'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className={`content_wrapper ${styles.libraryContainer}`}>
      <h1 className={styles.mainTitle}>Biblioteca de Cartas</h1>
      <p className={styles.subtitle}>Explore o significado de cada uma das 78 cartas do Tarot de Rider-Waite.</p>

      <section className={styles.oracleTracks}>
        {oracleTracks.map((track) => (
          <article key={track.title} className={styles.trackCard}>
            <h2>{track.title}</h2>
            <p>{track.description}</p>
            <Link to={track.to}>{track.cta}</Link>
          </article>
        ))}
      </section>

      {selectedCard && (
        <section className={styles.selectedPanel}>
          <p className={styles.selectedTag}>Carta selecionada para estudo</p>
          <h2>{selectedCard.nome}</h2>
          <p>
            Use esta carta como tema da semana e leve a interpretação para discussões com a
            comunidade nos espaços de fórum e debates.
          </p>
          <div className={styles.selectedActions}>
            <Link to={`/biblioteca/${selectedCard.slug}`}>Estudo completo da carta</Link>
            <Link to="/comunidade/forum">Discutir no fórum</Link>
            <Link to="/comunidade/debates">Levar para debates</Link>
          </div>
        </section>
      )}

      <nav className={styles.tabNav}>
        {Object.keys(tabs).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`${styles.tabButton} ${activeTab === tabKey ? styles.activeTab : ''}`}
          >
            {tabs[tabKey].title}
          </button>
        ))}
      </nav>

      <div className={styles.contentContainer}>
        {tabs[activeTab] && renderCardSection(tabs[activeTab].title, tabs[activeTab].cards)}
      </div>
    </div>
  );
}

export default CardLibraryPage;