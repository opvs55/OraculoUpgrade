import React from 'react';
import styles from '../../pages/NumerologyPage.module.css';

const renderFormattedText = (text) => {
  if (!text) return null;
  const regex = /\*\*(.*?)\*\*/g;

  return (
    <div className={styles.meaningText}>
      {text.split('\n').map((paragraph, pIndex) => {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph) return null;

        const parts = trimmedParagraph.split(regex);
        return (
          <p key={pIndex}>
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
};

function NumerologyResults({ resultData, onReset, isResetting, errorResetting }) {
  const lifePathNumber = resultData?.life_path_number ?? '—';
  let archetypeData = null;
  let archetypeParseError = null;
  const rawArchetypeText = resultData?.birthday_secret_meaning;

  if (rawArchetypeText) {
    try {
      archetypeData = JSON.parse(rawArchetypeText);
    } catch (error) {
      if (rawArchetypeText.startsWith('{"error":')) {
        archetypeParseError = JSON.parse(rawArchetypeText).error;
      } else {
        archetypeData = {
          archetype_title: 'O Arquétipo do Seu Dia de Nascimento',
          archetype_description: rawArchetypeText,
          numerology_details: null,
          tarot_card: null,
          advice: null,
          strengths: [],
          weaknesses: [],
        };
      }
      console.warn('Falha ao interpretar o arquétipo secreto:', error);
    }
  }

  const hasStructuredArchetype = Boolean(archetypeData?.numerology_details);

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultContent}>
        <section className={styles.lifePathHero}>
          <div className={styles.lifePathOrb} aria-label={`Número ${lifePathNumber}`}>{lifePathNumber}</div>
          <div className={styles.orbMeta}>
            <p className={styles.eyebrow}>Número de caminho de vida</p>
            <h2 className={styles.heroTitle}>Sua vibração principal desta jornada</h2>
            <p className={styles.heroDescription}>
              A numerologia revela o padrão-base da sua energia. Use este número como foco para decisões, ritmo e autoconhecimento.
            </p>
          </div>
        </section>

        {archetypeParseError && (
          <div className={`${styles.resultCard} ${styles.secretMeaningCard}`}>
            <h3 className={styles.cardTitle}>O Arquétipo do Seu Dia de Nascimento</h3>
            <p className={styles.errorMessage}>{archetypeParseError}</p>
          </div>
        )}

        {!archetypeParseError && !archetypeData && (
          <div className={`${styles.resultCard} ${styles.secretMeaningCard}`}>
            <h3 className={styles.cardTitle}>Arquétipo indisponível</h3>
            <p className={styles.warningMessage}>
              Ainda não foi possível montar o seu card de arquétipo. Tente recalcular em instantes.
            </p>
          </div>
        )}

        {!archetypeParseError && archetypeData && (
          <div className={`${styles.resultCard} ${styles.secretMeaningCard}`}>
            <h3 className={styles.cardTitle}>
              {archetypeData.archetype_title || 'O Arquétipo do Seu Dia de Nascimento'}
            </h3>

            {!hasStructuredArchetype && (
              <div className={styles.cardSubSection}>
                {renderFormattedText(archetypeData.archetype_description)}
              </div>
            )}

            {hasStructuredArchetype && (
              <div className={styles.archetypeGridContainer}>
                <div className={styles.archetypeMain}>
                  <div className={styles.archetypeSection}>
                    <h4>Arquétipo central</h4>
                    {renderFormattedText(archetypeData.archetype_description)}
                  </div>

                  {archetypeData.numerology_details && (
                    <div className={styles.archetypeSection}>
                      <h4>Numerologia e planetas</h4>
                      {renderFormattedText(archetypeData.numerology_details)}
                    </div>
                  )}

                  {archetypeData.tarot_card && (
                    <div className={styles.archetypeSection}>
                      <h4>Correspondência no Tarot</h4>
                      {renderFormattedText(archetypeData.tarot_card)}
                    </div>
                  )}
                </div>

                <div className={styles.archetypeSidebar}>
                  {archetypeData.advice && (
                    <div className={`${styles.archetypeListCard} ${styles.adviceCard}`}>
                      <h5>Conselho</h5>
                      {renderFormattedText(archetypeData.advice)}
                    </div>
                  )}

                  {archetypeData.strengths?.length > 0 && (
                    <div className={`${styles.archetypeListCard} ${styles.strengthsCard}`}>
                      <h5>Pontos fortes</h5>
                      <ul className={styles.archetypeList}>
                        {archetypeData.strengths.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {archetypeData.weaknesses?.length > 0 && (
                    <div className={`${styles.archetypeListCard} ${styles.weaknessesCard}`}>
                      <h5>Pontos de atenção</h5>
                      <ul className={styles.archetypeList}>
                        {archetypeData.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <div className={styles.resultActions}>
        <button onClick={onReset} className={styles.resetButton} disabled={isResetting}>
          {isResetting ? 'Apagando...' : 'Refazer minha leitura'}
        </button>
      </div>
      {errorResetting && (
        <p className={`${styles.errorMessage} ${styles.resetError}`}>
          Erro ao apagar: {errorResetting.message}
        </p>
      )}
    </div>
  );
}

export default NumerologyResults;
