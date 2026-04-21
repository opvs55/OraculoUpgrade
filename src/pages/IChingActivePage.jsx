import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import HexagramDisplay from '../components/iching/HexagramDisplay';
import styles from './IChingActivePage.module.css';

export default function IChingActivePage() {
  usePageTitle('I Ching — Consulta');
  const { user } = useAuth();
  const qc = useQueryClient();
  const [question, setQuestion] = useState('');
  const [formError, setFormError] = useState(null);
  const [activeResult, setActiveResult] = useState(null);

  const historyQuery = useQuery({
    queryKey: ['iching-active-history', user?.id],
    enabled: !!user?.id && !activeResult,
    queryFn: () => oraclesApi.getIchingActiveHistory(5),
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: (payload) => oraclesApi.postIchingActive(payload),
    onSuccess: (data) => {
      setActiveResult(data);
      qc.invalidateQueries({ queryKey: ['iching-active-history', user?.id] });
    },
    onError: (err) => setFormError(err?.message || 'Erro ao consultar o I Ching.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!question.trim() || question.trim().length < 5) return setFormError('A pergunta deve ter pelo menos 5 caracteres.');
    mutation.mutate({ question: question.trim() });
  };

  const result = activeResult?.result_payload;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>I Ching · Consulta Ativa</p>
        <h1>Consulte o Livro das Mutações</h1>
        <p className={styles.subtitle}>Formule uma pergunta clara e receba a sabedoria do hexagrama.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>

        {!user && (
          <div className={styles.guestBox}>
            <p className={styles.guestTitle}>Consulta Ativa</p>
            <p className={styles.guestDesc}>Esta feature requer uma conta. <Link to="/cadastro" className={styles.inlineLink}>Criar conta gratuitamente</Link></p>
          </div>
        )}

        {user && !result && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.questionLabel} htmlFor="ichingQuestion">
              Qual é sua pergunta?
            </label>
            <textarea
              id="ichingQuestion"
              className={styles.questionInput}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Escreva sua pergunta com clareza e intenção..."
              rows={4}
              maxLength={300}
            />
            <p className={styles.charCount}>{question.length}/300</p>
            {formError && <p className={styles.error}>{formError}</p>}
            <button type="submit" className={styles.submitButton} disabled={mutation.isPending}>
              {mutation.isPending ? '☯ Consultando...' : 'Lançar o I Ching'}
            </button>
          </form>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.hexagramHeader}>
              <div className={styles.hexagramOrb}>
                <span className={styles.hexNumber}>{result.hexagram_number}</span>
              </div>
              <div>
                <p className={styles.hexLabel}>Hexagrama {result.hexagram_number}</p>
                <h2 className={styles.hexName}>{result.hexagram_name}</h2>
                {result.headline && <p className={styles.hexHeadline}>{result.headline}</p>}
              </div>
            </div>

            {Array.isArray(result.lines) && result.lines.length === 6 && (
              <HexagramDisplay lines={result.lines} />
            )}

            <div className={styles.questionBox}>
              <p className={styles.questionBoxLabel}>Sua pergunta</p>
              <p className={styles.questionBoxText}>{activeResult.question}</p>
            </div>

            {result.interpretation && (
              <div className={styles.interpretationCard}>
                <p className={styles.cardLabel}>Interpretação</p>
                {result.interpretation.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i} className={styles.interpretationPara}>{p}</p>
                ))}
              </div>
            )}

            {result.changing_lines_meaning && activeResult.changing_lines?.length > 0 && (
              <div className={styles.interpretationCard}>
                <p className={styles.cardLabel}>Linhas em mutação · {activeResult.changing_lines.join(', ')}</p>
                <p className={styles.interpretationPara}>{result.changing_lines_meaning}</p>
              </div>
            )}

            {result.advice && (
              <div className={styles.adviceCard}>
                <p className={styles.cardLabel}>Conselho</p>
                <p className={styles.interpretationPara}>{result.advice}</p>
              </div>
            )}

            <button className={styles.newButton} onClick={() => { setActiveResult(null); setQuestion(''); }} type="button">
              Nova consulta
            </button>
          </div>
        )}

        {user && !result && historyQuery.data?.length > 0 && (
          <div className={styles.history}>
            <p className={styles.historyLabel}>Consultas recentes</p>
            {historyQuery.data.map(item => (
              <button key={item.id} className={styles.historyItem} onClick={() => setActiveResult(item)} type="button">
                <span className={styles.historyHex}>Hex. {item.hexagram_number}</span>
                <span className={styles.historyQuestion}>{item.question}</span>
                <span className={styles.historyDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
