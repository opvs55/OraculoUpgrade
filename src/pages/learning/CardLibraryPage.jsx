import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { baralhoDetalhado } from '../../tarotDeck';
import { RUNES } from '../../constants/runes';
import CardPreview from '../../components/CardPreview/CardPreview';
import { usePageTitle } from '../../hooks/usePageTitle';
import styles from './CardLibraryPage.module.css';

const RUNES_LIST = Object.entries(RUNES).map(([key, rune]) => ({ key, ...rune }));

const ICHING_HEXAGRAMS = [
  { number: 1, name: 'Qian — O Criativo', focus: 'Iniciativa, liderança e potência criadora.' },
  { number: 2, name: 'Kun — O Receptivo', focus: 'Entrega, acolhimento e força do suporte.' },
  { number: 3, name: 'Zhun — Dificuldade Inicial', focus: 'Começos caóticos que pedem estrutura.' },
  { number: 4, name: 'Meng — Juventude Inexperiente', focus: 'Aprender com humildade e orientação.' },
  { number: 5, name: 'Xu — A Espera', focus: 'Maturar o tempo e preparar o terreno.' },
  { number: 6, name: 'Song — Conflito', focus: 'Negociar tensão com clareza e limite.' },
  { number: 7, name: 'Shi — O Exército', focus: 'Disciplina, estratégia e união de forças.' },
  { number: 8, name: 'Bi — A União', focus: 'Aliança correta e confiança mútua.' },
  { number: 9, name: 'Xiao Chu — Pequeno Domínio', focus: 'Refino gradual e progresso contido.' },
  { number: 10, name: 'Lu — A Conduta', focus: 'Postura correta diante de forças maiores.' },
  { number: 11, name: 'Tai — Paz', focus: 'Fluxo harmônico entre céu e terra.' },
  { number: 12, name: 'Pi — Estagnação', focus: 'Bloqueio temporário e revisão de rota.' },
  { number: 13, name: 'Tong Ren — Comunidade', focus: 'Coesão, propósito e conexão coletiva.' },
  { number: 14, name: 'Da You — Grande Posse', focus: 'Abundância com responsabilidade.' },
  { number: 15, name: 'Qian — Modéstia', focus: 'Humildade que fortalece o caminho.' },
  { number: 16, name: 'Yu — Entusiasmo', focus: 'Mobilizar energia com direção.' },
  { number: 17, name: 'Sui — Seguir', focus: 'Acompanhar o fluxo certo sem se perder.' },
  { number: 18, name: 'Gu — Corrigir a Deterioração', focus: 'Limpar padrões antigos e restaurar ordem.' },
  { number: 19, name: 'Lin — Aproximação', focus: 'Chegada de apoio e expansão gradual.' },
  { number: 20, name: 'Guan — Contemplação', focus: 'Visão ampla e auto-observação.' },
  { number: 21, name: 'Shi He — Morder e Romper', focus: 'Romper bloqueios com ação firme.' },
  { number: 22, name: 'Bi — Graça', focus: 'Beleza, forma e refinamento da expressão.' },
  { number: 23, name: 'Bo — Desintegração', focus: 'Desapego do que não se sustenta mais.' },
  { number: 24, name: 'Fu — Retorno', focus: 'Recomeço após um ciclo de queda.' },
  { number: 25, name: 'Wu Wang — Inocência', focus: 'Ação limpa, sem manipulação.' },
  { number: 26, name: 'Da Chu — Grande Domínio', focus: 'Acumular força para o momento certo.' },
  { number: 27, name: 'Yi — Nutrição', focus: 'Nutrir corpo, mente e palavra.' },
  { number: 28, name: 'Da Guo — Excesso', focus: 'Pressão estrutural e ajuste imediato.' },
  { number: 29, name: 'Kan — O Abissal', focus: 'Risco, profundidade e perseverança.' },
  { number: 30, name: 'Li — O Aderente', focus: 'Luz, discernimento e clareza mental.' },
  { number: 31, name: 'Xian — Influência', focus: 'Atração, ressonância e reciprocidade.' },
  { number: 32, name: 'Heng — Duração', focus: 'Constância, compromisso e continuidade.' },
  { number: 33, name: 'Dun — Retirada', focus: 'Recuar com inteligência estratégica.' },
  { number: 34, name: 'Da Zhuang — Grande Poder', focus: 'Força ativa guiada por ética.' },
  { number: 35, name: 'Jin — Progresso', focus: 'Avanço visível e reconhecimento.' },
  { number: 36, name: 'Ming Yi — Escurecimento da Luz', focus: 'Proteger a luz em tempos densos.' },
  { number: 37, name: 'Jia Ren — Família', focus: 'Ordem interna e papéis bem definidos.' },
  { number: 38, name: 'Kui — Oposição', focus: 'Diferenças que exigem diplomacia.' },
  { number: 39, name: 'Jian — Obstáculo', focus: 'Travamento que pede reposicionamento.' },
  { number: 40, name: 'Jie — Liberação', focus: 'Alívio e resolução de tensão.' },
  { number: 41, name: 'Sun — Diminuição', focus: 'Cortar excesso para ganhar foco.' },
  { number: 42, name: 'Yi — Aumento', focus: 'Expansão apoiada por generosidade.' },
  { number: 43, name: 'Guai — Determinação', focus: 'Decisão firme para remover o nocivo.' },
  { number: 44, name: 'Gou — Encontro', focus: 'Contato inesperado com força intensa.' },
  { number: 45, name: 'Cui — Reunião', focus: 'Convergência e alinhamento de grupo.' },
  { number: 46, name: 'Sheng — Ascensão', focus: 'Crescimento gradual e consistente.' },
  { number: 47, name: 'Kun — Exaustão', focus: 'Pressão interna e economia de energia.' },
  { number: 48, name: 'Jing — O Poço', focus: 'Fonte essencial e trabalho de base.' },
  { number: 49, name: 'Ge — Revolução', focus: 'Mudança radical no momento adequado.' },
  { number: 50, name: 'Ding — O Caldeirão', focus: 'Transmutação e refinamento interior.' },
  { number: 51, name: 'Zhen — O Trovão', focus: 'Choque que desperta consciência.' },
  { number: 52, name: 'Gen — A Montanha', focus: 'Imobilidade consciente e pausa sábia.' },
  { number: 53, name: 'Jian — Desenvolvimento', focus: 'Evolução gradual e orgânica.' },
  { number: 54, name: 'Gui Mei — A Donzela', focus: 'Relações com papéis assimétricos.' },
  { number: 55, name: 'Feng — Abundância', focus: 'Pico de energia e intensidade.' },
  { number: 56, name: 'Lu — O Viajante', focus: 'Deslocamento e adaptação rápida.' },
  { number: 57, name: 'Xun — O Suave', focus: 'Penetração gradual e constância.' },
  { number: 58, name: 'Dui — O Lago', focus: 'Alegria compartilhada e abertura.' },
  { number: 59, name: 'Huan — Dispersão', focus: 'Dissolver bloqueios emocionais.' },
  { number: 60, name: 'Jie — Limitação', focus: 'Limites saudáveis e medida correta.' },
  { number: 61, name: 'Zhong Fu — Verdade Interior', focus: 'Autenticidade e coerência interna.' },
  { number: 62, name: 'Xiao Guo — Pequeno Excesso', focus: 'Atenção aos detalhes e moderação.' },
  { number: 63, name: 'Ji Ji — Após a Conclusão', focus: 'Ciclo concluído pedindo vigilância.' },
  { number: 64, name: 'Wei Ji — Antes da Conclusão', focus: 'Transição final ainda em aberto.' },
];

const NUMEROLOGY_CARDS = [
  { icon: '∞', title: 'Caminho de Vida', desc: 'Número central da sua jornada. Calculado pela data de nascimento completa, revela propósito, tendências e desafios estruturais da sua vida.', cta: '/numerologia' },
  { icon: '○', title: 'Número de Nascimento', desc: 'Vibração do dia em que você nasceu. Aponta dons naturais, traços centrais de personalidade e energia de partida.', cta: '/numerologia' },
  { icon: '◈', title: 'Numerologia Semanal', desc: 'Leitura de ciclo curto para foco da semana, energia dominante e direção prática. Atualizada a cada segunda-feira.', cta: '/numerologia' },
  { icon: '✦', title: 'Síntese Integrada', desc: 'Cruza a vibração semanal com Tarot, Runas e I Ching para uma leitura unificada do momento presente.', cta: '/oraculo/geral' },
];

const ORACLE_TABS = [
  { id: 'tarot', label: 'Tarot' },
  { id: 'runas', label: 'Runas' },
  { id: 'iching', label: 'I Ching' },
  { id: 'numerologia', label: 'Numerologia' },
];

const TAROT_SECTIONS = [
  { key: 'maiores', label: 'Arcanos Maiores', filter: c => c.tipo === 'Arcano Maior' },
  { key: 'paus', label: 'Paus', filter: c => c.naipe === 'Paus' },
  { key: 'copas', label: 'Copas', filter: c => c.naipe === 'Copas' },
  { key: 'espadas', label: 'Espadas', filter: c => c.naipe === 'Espadas' },
  { key: 'ouros', label: 'Ouros', filter: c => c.naipe === 'Ouros' },
];

function CardLibraryPage() {
  usePageTitle('Biblioteca');
  const [oracleTab, setOracleTab] = useState('tarot');
  const [tarotSection, setTarotSection] = useState('maiores');
  const [expandedRune, setExpandedRune] = useState(null);

  const visibleCards = useMemo(() => {
    const sec = TAROT_SECTIONS.find(s => s.key === tarotSection);
    return sec ? baralhoDetalhado.filter(sec.filter) : [];
  }, [tarotSection]);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Esotericon</p>
        <h1 className={styles.mainTitle}>Biblioteca Oracular</h1>
        <p className={styles.subtitle}>Estude os 4 sistemas oraculares em um só lugar.</p>
      </header>

      <nav className={styles.oracleTabs}>
        {ORACLE_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setOracleTab(tab.id)}
            className={oracleTab === tab.id ? styles.oracleTabActive : styles.oracleTab}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── TAROT ── */}
      {oracleTab === 'tarot' && (
        <section className={styles.tabContent}>
          <div className={styles.tabHero}>
            <div>
              <h2>Tarot de Rider-Waite</h2>
              <p>78 cartas organizadas em Arcanos Maiores (22) e Menores (56). Cada carta é um arquétipo da experiência humana.</p>
            </div>
            <Link to="/tarot" className={styles.heroCta}>Fazer leitura →</Link>
          </div>

          <nav className={styles.sectionNav}>
            {TAROT_SECTIONS.map(sec => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setTarotSection(sec.key)}
                className={tarotSection === sec.key ? styles.sectionTabActive : styles.sectionTab}
              >
                {sec.label}
              </button>
            ))}
          </nav>

          <div className={styles.cardGrid}>
            {visibleCards.map(card => (
              <article key={card.id} className={styles.cardItem}>
                <CardPreview card={card} />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── RUNAS ── */}
      {oracleTab === 'runas' && (
        <section className={styles.tabContent}>
          <div className={styles.tabHero}>
            <div>
              <h2>Futhark Antigo</h2>
              <p>24 runas do alfabeto nórdico, cada uma com uma força arquetípica. Clique em qualquer runa para ver luz, sombra e palavras-chave.</p>
            </div>
            <Link to="/runas" className={styles.heroCta}>Abrir Runas →</Link>
          </div>

          <div className={styles.runesGrid}>
            {RUNES_LIST.map(rune => (
              <article
                key={rune.key}
                className={`${styles.runeCard} ${expandedRune === rune.key ? styles.runeCardExpanded : ''}`}
                onClick={() => setExpandedRune(expandedRune === rune.key ? null : rune.key)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setExpandedRune(expandedRune === rune.key ? null : rune.key)}
              >
                <span className={styles.runeSymbol}>{rune.symbol}</span>
                <h4 className={styles.runeName}>{rune.name}</h4>
                <div className={styles.runeKeywords}>
                  {rune.keywords.map(k => <span key={k}>{k}</span>)}
                </div>
                {expandedRune === rune.key && (
                  <div className={styles.runeExpanded}>
                    <p><strong>Luz:</strong> {rune.keywords[0]} em expansão</p>
                    <p><strong>Sombra:</strong> {rune.keywords[0]} em excesso ou bloqueio</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── I CHING ── */}
      {oracleTab === 'iching' && (
        <section className={styles.tabContent}>
          <div className={styles.tabHero}>
            <div>
              <h2>I Ching — Livro das Mutações</h2>
              <p>64 hexagramas formados por 8 trigramas. Cada combinação revela uma dinâmica de mudança e uma postura estratégica.</p>
            </div>
            <Link to="/iching" className={styles.heroCta}>Abrir I Ching →</Link>
          </div>

          <div className={styles.ichingGrid}>
            {ICHING_HEXAGRAMS.map(h => (
              <article key={h.number} className={styles.ichingCard}>
                <span className={styles.ichingNumber}>{h.number}</span>
                <h4 className={styles.ichingName}>{h.name}</h4>
                <p className={styles.ichingFocus}>{h.focus}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── NUMEROLOGIA ── */}
      {oracleTab === 'numerologia' && (
        <section className={styles.tabContent}>
          <div className={styles.tabHero}>
            <div>
              <h2>Numerologia Esotérica</h2>
              <p>Dois eixos de leitura: base natal (permanente) e ciclo semanal (dinâmico). Juntos revelam identidade e timing.</p>
            </div>
            <Link to="/numerologia" className={styles.heroCta}>Abrir Numerologia →</Link>
          </div>

          <div className={styles.numerologyGrid}>
            {NUMEROLOGY_CARDS.map(card => (
              <article key={card.title} className={styles.numerologyCard}>
                <span className={styles.numerologyIcon}>{card.icon}</span>
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
                <Link to={card.cta} className={styles.numerologyCta}>Acessar →</Link>
              </article>
            ))}
          </div>

          <div className={styles.numerologyNote}>
            <p>Dica: faça a leitura pessoal uma vez para definir seu eixo base, depois gere a semanal todo início de semana e cruze com a Síntese Integrada.</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default CardLibraryPage;