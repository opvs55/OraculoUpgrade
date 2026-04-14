import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { RUNES } from '../../constants/runes';
import { goBackOrFallback } from '../../utils/navigation';
import styles from './OracleLibraryPage.module.css';

const ICHING_HEXAGRAMS = [
  { number: 1, name: 'Qian - O Criativo', trigramUpper: 'Céu', trigramLower: 'Céu', focus: 'Iniciativa, liderança e potência criadora.' },
  { number: 2, name: 'Kun - O Receptivo', trigramUpper: 'Terra', trigramLower: 'Terra', focus: 'Entrega, acolhimento e força do suporte.' },
  { number: 3, name: 'Zhun - Dificuldade Inicial', trigramUpper: 'Água', trigramLower: 'Trovão', focus: 'Começos caóticos que pedem estrutura.' },
  { number: 4, name: 'Meng - Juventude Inexperiente', trigramUpper: 'Montanha', trigramLower: 'Água', focus: 'Aprender com humildade e orientação.' },
  { number: 5, name: 'Xu - A Espera', trigramUpper: 'Água', trigramLower: 'Céu', focus: 'Maturar o tempo e preparar o terreno.' },
  { number: 6, name: 'Song - Conflito', trigramUpper: 'Céu', trigramLower: 'Água', focus: 'Negociar tensão com clareza e limite.' },
  { number: 7, name: 'Shi - O Exército', trigramUpper: 'Terra', trigramLower: 'Água', focus: 'Disciplina, estratégia e união de forças.' },
  { number: 8, name: 'Bi - A União', trigramUpper: 'Água', trigramLower: 'Terra', focus: 'Aliança correta e confiança mútua.' },
  { number: 9, name: 'Xiao Chu - Pequeno Domínio', trigramUpper: 'Vento', trigramLower: 'Céu', focus: 'Refino gradual e progresso contido.' },
  { number: 10, name: 'Lu - A Conduta', trigramUpper: 'Céu', trigramLower: 'Lago', focus: 'Postura correta diante de forças maiores.' },
  { number: 11, name: 'Tai - Paz', trigramUpper: 'Terra', trigramLower: 'Céu', focus: 'Fluxo harmônico entre céu e terra.' },
  { number: 12, name: 'Pi - Estagnação', trigramUpper: 'Céu', trigramLower: 'Terra', focus: 'Bloqueio temporário e revisão de rota.' },
  { number: 13, name: 'Tong Ren - Comunidade', trigramUpper: 'Céu', trigramLower: 'Fogo', focus: 'Coesão, propósito e conexão coletiva.' },
  { number: 14, name: 'Da You - Grande Posse', trigramUpper: 'Fogo', trigramLower: 'Céu', focus: 'Abundância com responsabilidade.' },
  { number: 15, name: 'Qian - Modéstia', trigramUpper: 'Terra', trigramLower: 'Montanha', focus: 'Humildade que fortalece o caminho.' },
  { number: 16, name: 'Yu - Entusiasmo', trigramUpper: 'Trovão', trigramLower: 'Terra', focus: 'Mobilizar energia com direção.' },
  { number: 17, name: 'Sui - Seguir', trigramUpper: 'Lago', trigramLower: 'Trovão', focus: 'Acompanhar o fluxo certo sem se perder.' },
  { number: 18, name: 'Gu - Corrigir a Deterioração', trigramUpper: 'Montanha', trigramLower: 'Vento', focus: 'Limpar padrões antigos e restaurar ordem.' },
  { number: 19, name: 'Lin - Aproximação', trigramUpper: 'Terra', trigramLower: 'Lago', focus: 'Chegada de apoio e expansão gradual.' },
  { number: 20, name: 'Guan - Contemplação', trigramUpper: 'Vento', trigramLower: 'Terra', focus: 'Visão ampla e auto-observação.' },
  { number: 21, name: 'Shi He - Morder e Romper', trigramUpper: 'Fogo', trigramLower: 'Trovão', focus: 'Romper bloqueios com ação firme.' },
  { number: 22, name: 'Bi - Graça', trigramUpper: 'Montanha', trigramLower: 'Fogo', focus: 'Beleza, forma e refinamento da expressão.' },
  { number: 23, name: 'Bo - Desintegração', trigramUpper: 'Montanha', trigramLower: 'Terra', focus: 'Desapego do que não se sustenta mais.' },
  { number: 24, name: 'Fu - Retorno', trigramUpper: 'Terra', trigramLower: 'Trovão', focus: 'Recomeço após um ciclo de queda.' },
  { number: 25, name: 'Wu Wang - Inocência', trigramUpper: 'Céu', trigramLower: 'Trovão', focus: 'Ação limpa, sem manipulação.' },
  { number: 26, name: 'Da Chu - Grande Domínio', trigramUpper: 'Montanha', trigramLower: 'Céu', focus: 'Acumular força para o momento certo.' },
  { number: 27, name: 'Yi - Nutrição', trigramUpper: 'Montanha', trigramLower: 'Trovão', focus: 'Nutrir corpo, mente e palavra.' },
  { number: 28, name: 'Da Guo - Excesso', trigramUpper: 'Lago', trigramLower: 'Vento', focus: 'Pressão estrutural e ajuste imediato.' },
  { number: 29, name: 'Kan - O Abissal', trigramUpper: 'Água', trigramLower: 'Água', focus: 'Risco, profundidade e perseverança.' },
  { number: 30, name: 'Li - O Aderente', trigramUpper: 'Fogo', trigramLower: 'Fogo', focus: 'Luz, discernimento e clareza mental.' },
  { number: 31, name: 'Xian - Influência', trigramUpper: 'Lago', trigramLower: 'Montanha', focus: 'Atração, ressonância e reciprocidade.' },
  { number: 32, name: 'Heng - Duração', trigramUpper: 'Trovão', trigramLower: 'Vento', focus: 'Constância, compromisso e continuidade.' },
  { number: 33, name: 'Dun - Retirada', trigramUpper: 'Céu', trigramLower: 'Montanha', focus: 'Recuar com inteligência estratégica.' },
  { number: 34, name: 'Da Zhuang - Grande Poder', trigramUpper: 'Trovão', trigramLower: 'Céu', focus: 'Força ativa guiada por ética.' },
  { number: 35, name: 'Jin - Progresso', trigramUpper: 'Fogo', trigramLower: 'Terra', focus: 'Avanço visível e reconhecimento.' },
  { number: 36, name: 'Ming Yi - Escurecimento da Luz', trigramUpper: 'Terra', trigramLower: 'Fogo', focus: 'Proteger a luz em tempos densos.' },
  { number: 37, name: 'Jia Ren - Família', trigramUpper: 'Vento', trigramLower: 'Fogo', focus: 'Ordem interna e papéis bem definidos.' },
  { number: 38, name: 'Kui - Oposição', trigramUpper: 'Fogo', trigramLower: 'Lago', focus: 'Diferenças que exigem diplomacia.' },
  { number: 39, name: 'Jian - Obstáculo', trigramUpper: 'Água', trigramLower: 'Montanha', focus: 'Travamento que pede reposicionamento.' },
  { number: 40, name: 'Jie - Liberação', trigramUpper: 'Trovão', trigramLower: 'Água', focus: 'Alívio e resolução de tensão.' },
  { number: 41, name: 'Sun - Diminuição', trigramUpper: 'Montanha', trigramLower: 'Lago', focus: 'Cortar excesso para ganhar foco.' },
  { number: 42, name: 'Yi - Aumento', trigramUpper: 'Vento', trigramLower: 'Trovão', focus: 'Expansão apoiada por generosidade.' },
  { number: 43, name: 'Guai - Determinação', trigramUpper: 'Lago', trigramLower: 'Céu', focus: 'Decisão firme para remover o nocivo.' },
  { number: 44, name: 'Gou - Encontro', trigramUpper: 'Céu', trigramLower: 'Vento', focus: 'Contato inesperado com força intensa.' },
  { number: 45, name: 'Cui - Reunião', trigramUpper: 'Lago', trigramLower: 'Terra', focus: 'Convergência e alinhamento de grupo.' },
  { number: 46, name: 'Sheng - Ascensão', trigramUpper: 'Terra', trigramLower: 'Vento', focus: 'Crescimento gradual e consistente.' },
  { number: 47, name: 'Kun - Exaustão', trigramUpper: 'Lago', trigramLower: 'Água', focus: 'Pressão interna e economia de energia.' },
  { number: 48, name: 'Jing - O Poço', trigramUpper: 'Água', trigramLower: 'Vento', focus: 'Fonte essencial e trabalho de base.' },
  { number: 49, name: 'Ge - Revolução', trigramUpper: 'Lago', trigramLower: 'Fogo', focus: 'Mudança radical no momento adequado.' },
  { number: 50, name: 'Ding - O Caldeirão', trigramUpper: 'Fogo', trigramLower: 'Vento', focus: 'Transmutação e refinamento interior.' },
  { number: 51, name: 'Zhen - O Trovão', trigramUpper: 'Trovão', trigramLower: 'Trovão', focus: 'Choque que desperta consciência.' },
  { number: 52, name: 'Gen - A Montanha', trigramUpper: 'Montanha', trigramLower: 'Montanha', focus: 'Imobilidade consciente e pausa sábia.' },
  { number: 53, name: 'Jian - Desenvolvimento', trigramUpper: 'Vento', trigramLower: 'Montanha', focus: 'Evolução gradual e orgânica.' },
  { number: 54, name: 'Gui Mei - A Donzela', trigramUpper: 'Trovão', trigramLower: 'Lago', focus: 'Relações com papéis assimétricos.' },
  { number: 55, name: 'Feng - Abundância', trigramUpper: 'Trovão', trigramLower: 'Fogo', focus: 'Pico de energia e intensidade.' },
  { number: 56, name: 'Lu - O Viajante', trigramUpper: 'Fogo', trigramLower: 'Montanha', focus: 'Deslocamento e adaptação rápida.' },
  { number: 57, name: 'Xun - O Suave', trigramUpper: 'Vento', trigramLower: 'Vento', focus: 'Penetração gradual e constância.' },
  { number: 58, name: 'Dui - O Lago', trigramUpper: 'Lago', trigramLower: 'Lago', focus: 'Alegria compartilhada e abertura.' },
  { number: 59, name: 'Huan - Dispersão', trigramUpper: 'Vento', trigramLower: 'Água', focus: 'Dissolver bloqueios emocionais.' },
  { number: 60, name: 'Jie - Limitação', trigramUpper: 'Água', trigramLower: 'Lago', focus: 'Limites saudáveis e medida correta.' },
  { number: 61, name: 'Zhong Fu - Verdade Interior', trigramUpper: 'Vento', trigramLower: 'Lago', focus: 'Autenticidade e coerência interna.' },
  { number: 62, name: 'Xiao Guo - Pequeno Excesso', trigramUpper: 'Trovão', trigramLower: 'Montanha', focus: 'Atenção aos detalhes e moderação.' },
  { number: 63, name: 'Ji Ji - Após a Conclusão', trigramUpper: 'Água', trigramLower: 'Fogo', focus: 'Ciclo concluído pedindo vigilância.' },
  { number: 64, name: 'Wei Ji - Antes da Conclusão', trigramUpper: 'Fogo', trigramLower: 'Água', focus: 'Transição final ainda em aberto.' },
];

const NUMEROLOGY_GUIDE = [
  { title: 'Caminho de Vida', description: 'Número-base da jornada pessoal. Mostra tendências, desafios e propósito geral.' },
  { title: 'Número de Nascimento', description: 'Vibração ligada ao dia em que você nasceu. Aponta dons naturais e traços centrais.' },
  { title: 'Arquétipo Natal', description: 'Leitura simbólica integrando numerologia e linguagem arquetípica para orientar decisões.' },
  { title: 'Numerologia Semanal', description: 'Leitura de curto prazo para foco da semana, energia dominante e direção prática.' },
];

const RUNES_LIST = Object.entries(RUNES).map(([key, rune]) => ({
  key,
  ...rune,
}));

function OracleLibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const guideParam = searchParams.get('guia');
  const tab = ['runes', 'iching', 'numerology'].includes(guideParam) ? guideParam : 'runes';

  const handleBack = () => {
    goBackOrFallback({ navigate, location, fallbackPath: '/biblioteca' });
  };

  const activeTitle = useMemo(() => {
    if (tab === 'runes') return 'Runas';
    if (tab === 'iching') return 'I Ching';
    return 'Numerologia';
  }, [tab]);

  const handleTabChange = (nextTab) => {
    setSearchParams({ guia: nextTab });
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.hero}>
        <h1>Biblioteca de Oráculos</h1>
        <p>
          Estrutura de estudo completa para Runas, I Ching e Numerologia, com organização didática no mesmo
          espírito da biblioteca de Tarot.
        </p>
        <button type="button" className={styles.backLink} onClick={handleBack}>← Voltar</button>
      </header>

      <nav className={styles.tabs}>
        <button type="button" onClick={() => handleTabChange('runes')} className={tab === 'runes' ? styles.tabButtonActive : styles.tabButton}>Runas</button>
        <button type="button" onClick={() => handleTabChange('iching')} className={tab === 'iching' ? styles.tabButtonActive : styles.tabButton}>I Ching</button>
        <button type="button" onClick={() => handleTabChange('numerology')} className={tab === 'numerology' ? styles.tabButtonActive : styles.tabButton}>Numerologia</button>
      </nav>

      {tab === 'runes' && (
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>{activeTitle}</h2>
            <p>
              As 24 runas do Futhark antigo representam forças arquetípicas. Leia símbolo, nome e palavras-chave
              para construir interpretações práticas e ritualísticas.
            </p>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statPill}>24 runas</span>
            <span className={styles.statPill}>Luz e sombra</span>
            <span className={styles.statPill}>Aplicação semanal</span>
          </div>

          <div className={styles.subSection}>
            <h3>As 24 runas</h3>
          </div>
          <div className={styles.runesGrid}>
            {RUNES_LIST.map((rune) => (
              <article key={rune.key} className={styles.runeCard}>
                <span className={styles.runeSymbol}>{rune.symbol}</span>
                <h4>{rune.name}</h4>
                <div className={styles.runeKeywords}>
                  {rune.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className={styles.subSection}>
            <h3>Como estudar</h3>
            <ul className={styles.list}>
              <li>Observe o símbolo e associe a palavra-chave principal.</li>
              <li>Interprete em luz (expansão) e em sombra (excesso ou bloqueio).</li>
              <li>Conecte com o momento da semana no seu grimório.</li>
            </ul>
          </div>
          <p className={styles.note}>
            Dica: use 1 runa para foco diário ou 3 runas para leitura de passado, presente e direção.
          </p>
        </section>
      )}

      {tab === 'iching' && (
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>{activeTitle}</h2>
            <p>
              O I Ching trabalha com 64 hexagramas. Cada forma combina trigramas e revela dinâmica de mudança,
              contexto estratégico e postura recomendada.
            </p>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statPill}>64 hexagramas</span>
            <span className={styles.statPill}>8 trigramas</span>
            <span className={styles.statPill}>Linhas mutantes</span>
          </div>

          <div className={styles.subSection}>
            <h3>Como interpretar</h3>
            <div className={styles.icGrid}>
              <article className={styles.icCard}>
                <h4>1) Estrutura</h4>
                <p>Leia trigrama superior e inferior para entender contexto externo e interno.</p>
              </article>
              <article className={styles.icCard}>
                <h4>2) Movimento</h4>
                <p>Linhas mutantes mostram onde a situação pede ajuste imediato.</p>
              </article>
              <article className={styles.icCard}>
                <h4>3) Decisão</h4>
                <p>Extraia uma ação concreta e um ponto de prudência para a semana.</p>
              </article>
            </div>
          </div>

          <div className={styles.subSection}>
            <h3>Catálogo dos 64 hexagramas</h3>
          </div>
          <div className={styles.icGrid}>
            {ICHING_HEXAGRAMS.map((hexagram) => (
              <article key={hexagram.number} className={styles.icCard}>
                <strong>Hexagrama {hexagram.number}</strong>
                <h4>{hexagram.name}</h4>
                <p>{hexagram.focus}</p>
                <small>{hexagram.trigramUpper} sobre {hexagram.trigramLower}</small>
              </article>
            ))}
          </div>
          <p className={styles.note}>
            Leitura rápida: combine mensagem central + linha mutante principal + ação prática para os próximos 7 dias.
          </p>
        </section>
      )}

      {tab === 'numerology' && (
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>{activeTitle}</h2>
            <p>
              A numerologia do app funciona em duas camadas: leitura pessoal (base natal) e leitura semanal
              (foco de ciclo). Juntas, elas orientam identidade e timing.
            </p>
          </div>
          <div className={styles.statsRow}>
            <span className={styles.statPill}>Leitura pessoal</span>
            <span className={styles.statPill}>Leitura semanal</span>
            <span className={styles.statPill}>Aplicação prática</span>
          </div>

          <div className={styles.subSection}>
            <h3>Como funciona no app</h3>
          </div>
          <div className={styles.icGrid}>
            {NUMEROLOGY_GUIDE.map((item) => (
              <article key={item.title} className={styles.icCard}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className={styles.subSection}>
            <h3>Fluxo recomendado</h3>
            <ul className={styles.list}>
              <li>Faça a leitura pessoal uma vez para definir seu eixo base.</li>
              <li>Gere a numerologia semanal para orientar foco e prioridade.</li>
              <li>Cruze numerologia com Tarot e Síntese Semanal para decisões mais consistentes.</li>
            </ul>
          </div>
          <p className={styles.note}>
            Numerologia não substitui leitura de Tarot; ela calibra contexto, ritmo e momento de ação.
          </p>
        </section>
      )}

      <div className={styles.subSection}>
        <h3>Leituras práticas</h3>
        <div className={styles.statsRow}>
          <Link to="/runas" className={styles.ctaLink}>Abrir Runas Semanais</Link>
          <Link to="/iching" className={styles.ctaLink}>Abrir I Ching Semanal</Link>
          <Link to="/numerologia" className={styles.ctaLink}>Abrir Numerologia</Link>
        </div>
      </div>
    </div>
  );
}

export default OracleLibraryPage;
