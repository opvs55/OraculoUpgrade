import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGenerateReading } from '../hooks/useReadings';
import Loader from '../components/common/Loader/Loader';
import { suggestedQuestions } from '../constants/suggestionConstants';
import styles from './TarotPage.module.css';

const listaDeVideos = [
  '/assets/video1.mp4',
  '/assets/video2.mp4',
  '/assets/video3.mp4',
  '/assets/video4.mp4',
  '/assets/video5.mp4',
];

const VISITOR_READING_KEY = 'visitorReadingDone';
const mysticPhrase = 'O que o destino deseja revelar hoje?';

// As 4 tiragens ficam sempre visíveis, lado a lado — nada de esconder atrás
// de um toggle. "3 Cartas" é a porta de entrada padrão (por isso vem
// primeiro e pré-selecionada), mas as outras competem de igual pra igual.
const SPREADS = [
  { id: 'threeCards', label: '3 Cartas', description: 'Passado, presente e futuro. Sua leitura padrão.' },
  { id: 'celticCross', label: 'Cruz Celta', description: 'Uma análise profunda em 10 cartas.' },
  { id: 'templeOfAphrodite', label: 'Templo de Afrodite', description: 'Duas pessoas, uma relação, 7 cartas.' },
  { id: 'pathChoice', label: 'Escolha de Caminho', description: 'Dois caminhos possíveis, lado a lado.' },
];

function TarotPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: generateReading, isPending, error: mutationError, reset } = useGenerateReading();
  const [videoAtualIndex, setVideoAtualIndex] = useState(() => Math.floor(Math.random() * listaDeVideos.length));

  const [question, setQuestion] = useState('');
  const [path1, setPath1] = useState('');
  const [path2, setPath2] = useState('');
  const [selectedSpread, setSelectedSpread] = useState('threeCards');
  const [visitorHasRead, setVisitorHasRead] = useState(false);
  const [formError, setFormError] = useState(null);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  useEffect(() => {
    if (!user) {
      const hasDoneReading = localStorage.getItem(VISITOR_READING_KEY);
      if (hasDoneReading === 'true') {
        setVisitorHasRead(true);
      }
    }
  }, [user]);

  const stableReset = useCallback(reset, [reset]);

  useEffect(() => {
    setQuestion('');
    setPath1('');
    setPath2('');
    setName1('');
    setName2('');
    stableReset();
    setFormError(null);
  }, [selectedSpread, stableReset]);

  const handleVideoEnd = () => {
    setVideoAtualIndex((prevIndex) => (prevIndex + 1) % listaDeVideos.length);
  };

  const handleGenerateReading = useCallback((spreadType, questionData) => {
    setFormError(null);
    reset();

    if (!user && visitorHasRead) {
      setFormError('Você já realizou sua leitura de teste gratuita. Cadastre-se ou faça login para leituras ilimitadas!');
      return;
    }

    generateReading({ question: questionData, user: user || null, spreadType: spreadType }, {
      onSuccess: (data) => {
        if (data.id && data.id.startsWith('temp-')) {
          localStorage.setItem(VISITOR_READING_KEY, 'true');
          setVisitorHasRead(true);
          navigate(`/leitura/${data.id}`, { state: { readingData: data, justRevealed: true } });
        } else {
          navigate(`/leitura/${data.id}`, { state: { justRevealed: true } });
        }
      },
      onError: (err) => {
        console.error('Erro no generateReading:', err);
      }
    });
  }, [user, visitorHasRead, generateReading, navigate, reset]);

  const handleStartReading = () => {
    setFormError(null);
    let questionData;

    if (selectedSpread === 'templeOfAphrodite') {
      if (name1.trim() === '' || name2.trim() === '') {
        setFormError('Por favor, preencha o seu nome e o nome da pessoa.');
        return;
      }
      questionData = { name1, name2 };
    } else if (selectedSpread === 'pathChoice') {
      if (path1.trim() === '' || path2.trim() === '') {
        setFormError('Por favor, descreva os dois caminhos.');
        return;
      }
      questionData = { path1, path2 };
    } else {
      if (question.trim() === '') {
        setFormError('Por favor, digite sua pergunta ou escolha uma sugestão.');
        return;
      }
      questionData = question;
    }

    handleGenerateReading(selectedSpread, questionData);
  };

  if (isPending) {
    return <Loader customText="Canalizando a sabedoria dos arcanos..." />;
  }

  const isLimitReached = !user && visitorHasRead;
  const submitLabel = isLimitReached
    ? 'Limite de teste atingido'
    : selectedSpread === 'pathChoice'
      ? 'Revelar os Caminhos'
      : 'Revelar Leitura';

  return (
    <div className={styles.homeContainer}>
      <video key={videoAtualIndex} autoPlay muted playsInline onEnded={handleVideoEnd} className={styles.videoFundo}>
        <source src={listaDeVideos[videoAtualIndex]} type="video/mp4" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
      <div className={styles.videoOverlay}></div>
      <div className={styles.conteudoCentralizado}>
        <h1 className={styles.mainTitleLogo}>ORÁCULO</h1>
        <p className={styles.mysticText} aria-live="polite">
          {mysticPhrase}
        </p>

        <div className={styles.formContainer}>
          <p className={styles.subtitle}>
            {selectedSpread === 'threeCards'
              ? 'Sua leitura de hoje: Passado, Presente e Futuro.'
              : 'Selecione um método de leitura abaixo.'}
          </p>

          <div className={styles.spreadPicker}>
            {SPREADS.map((spread) => (
              <button
                key={spread.id}
                type="button"
                onClick={() => setSelectedSpread(spread.id)}
                className={`${styles.spreadCard} ${selectedSpread === spread.id ? styles.spreadCardActive : ''}`}
              >
                <span className={styles.spreadCardLabel}>{spread.label}</span>
                <span className={styles.spreadCardDescription}>{spread.description}</span>
              </button>
            ))}
          </div>

          {selectedSpread === 'templeOfAphrodite' && (
            <div className={styles.pathChoiceContainer}>
              <p className={styles.subtitle}>Insira os nomes para a análise da relação:</p>
              <input
                type="text"
                className={styles.pathInput}
                placeholder="Seu nome (ou 'Eu')"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                disabled={isPending || isLimitReached}
              />
              <input
                type="text"
                className={styles.pathInput}
                placeholder="Nome da outra pessoa"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                disabled={isPending || isLimitReached}
              />
            </div>
          )}

          {selectedSpread === 'pathChoice' && (
            <div className={styles.pathChoiceContainer}>
              <p className={styles.subtitle}>Descreva os dois caminhos que você está considerando.</p>
              <input
                type="text"
                className={styles.pathInput}
                placeholder="Caminho 1 (ex: Ficar no emprego atual)"
                value={path1}
                onChange={(e) => setPath1(e.target.value)}
                disabled={isPending || isLimitReached}
              />
              <input
                type="text"
                className={styles.pathInput}
                placeholder="Caminho 2 (ex: Aceitar a nova proposta)"
                value={path2}
                onChange={(e) => setPath2(e.target.value)}
                disabled={isPending || isLimitReached}
              />
            </div>
          )}

          {(selectedSpread === 'threeCards' || selectedSpread === 'celticCross') && (
            <>
              {suggestedQuestions[selectedSpread]?.length > 0 && (
                <div className={styles.suggestionsContainer}>
                  <h4 className={styles.suggestionTitle}>Não sabe o que perguntar? Tente uma destas:</h4>
                  <ul className={styles.suggestionList}>
                    {suggestedQuestions[selectedSpread].map((q, index) => (
                      <li key={index} onClick={() => setQuestion(q)} className={styles.suggestionItem}>"{q}"</li>
                    ))}
                  </ul>
                </div>
              )}
              <textarea
                className={styles.questionTextarea}
                placeholder="Digite sua pergunta aqui ou clique em uma sugestão acima..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isPending || isLimitReached}
              />
            </>
          )}

          <button
            onClick={handleStartReading}
            disabled={isPending || isLimitReached}
            className={styles.mainSubmitButton}
          >
            {submitLabel}
          </button>

          {formError && <p className={styles.errorMessage}>{formError}</p>}
          {mutationError && <p className={styles.errorMessage}>Falha ao iniciar leitura: {mutationError.message}</p>}

          {isLimitReached && (
            <p className={styles.limitMessage}>Você já utilizou sua leitura de teste gratuita. <Link to="/cadastro">Cadastre-se</Link> ou <Link to="/login">faça login</Link> para leituras ilimitadas.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TarotPage;
