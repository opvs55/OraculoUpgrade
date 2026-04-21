import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/NumerologyPage.module.css';
import { getArcana, getYearArcana, getArcanaImageUrl } from '../../utils/arcanaMap';

const renderFormattedText = (text) => {
  if (!text) return null;
  const regex = /\*\*(.*?)\*\*/g;
  return (
    <div className={styles.meaningText}>
      {text.split('\n').map((paragraph, pIndex) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;
        const parts = trimmed.split(regex);
        return (
          <p key={pIndex}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
};

function ArcanaCard({ arcana, label, sublabel }) {
  const imgUrl = getArcanaImageUrl(arcana?.img);
  return (
    <div className={styles.arcanaCard}>
      <div className={styles.arcanaImgWrap}>
        {imgUrl
          ? <img src={imgUrl} alt={arcana.name} className={styles.arcanaImg} />
          : <div className={styles.arcanaImgPlaceholder}>{arcana?.number ?? '?'}</div>
        }
      </div>
      <div className={styles.arcanaInfo}>
        <p className={styles.arcanaEyebrow}>{label}</p>
        <p className={styles.arcanaNumber}>Arcano {arcana?.number}</p>
        <p className={styles.arcanaName}>{arcana?.name}</p>
        <p className={styles.arcanaKeyword}>{arcana?.keyword}</p>
        {sublabel && <p className={styles.arcanaSubLabel}>{sublabel}</p>}
      </div>
    </div>
  );
}

function NumerologyResults({ resultData, onReset, isResetting, errorResetting }) {
  const lifePathNumber = resultData?.life_path_number ?? null;
  const birthdayNumber = resultData?.birthday_number ?? null;
  const birthDate = resultData?.input_birth_date ?? null;

  const lifePathArcana = getArcana(lifePathNumber);
  const birthdayArcana = getArcana(birthdayNumber);
  const yearArcana = getYearArcana(birthDate);

  let archetypeData = null;
  let archetypeParseError = null;
  const rawArchetypeText = resultData?.birthday_secret_meaning;

  if (rawArchetypeText) {
    try {
      archetypeData = JSON.parse(rawArchetypeText);
      if (archetypeData?.error) {
        archetypeParseError = archetypeData.error;
        archetypeData = null;
      }
    } catch {
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
  }

  const hasStructuredArchetype = Boolean(archetypeData?.numerology_details);

  return (
    <div className={styles.resultsContainer}>

      {/* ── Arcanos visuais ── */}
      <div className={styles.arcanaRow}>
        {lifePathArcana && (
          <ArcanaCard
            arcana={lifePathArcana}
            label="Arcano do Caminho de Vida"
            sublabel={`Número ${lifePathNumber}`}
          />
        )}
        {birthdayArcana && birthdayNumber !== lifePathNumber && (
          <ArcanaCard
            arcana={birthdayArcana}
            label="Arcano do Dia de Nascimento"
            sublabel={`Número ${birthdayNumber}`}
          />
        )}
        {yearArcana && (
          <ArcanaCard
            arcana={yearArcana}
            label={`Arcano do Ano ${new Date().getFullYear()}`}
            sublabel="Vibração do seu ano atual"
          />
        )}
      </div>

      {/* ── Caminho de Vida ── */}
      {resultData?.life_path_meaning && (
        <div className={styles.sectionBlock}>
          <h3>Caminho de Vida · {lifePathNumber}</h3>
          {renderFormattedText(resultData.life_path_meaning)}
        </div>
      )}

      {/* ── Arquétipo do Dia de Nascimento ── */}
      {archetypeParseError && (
        <div className={styles.errorCard}>
          <h3>Arquétipo do Dia de Nascimento</h3>
          <p>{archetypeParseError}</p>
          <button onClick={onReset} className={styles.primaryButton} disabled={isResetting}>
            Recalcular
          </button>
        </div>
      )}

      {!archetypeParseError && !archetypeData && rawArchetypeText == null && (
        <div className={styles.messageCard}>
          <h3>Arquétipo do Dia de Nascimento</h3>
          <p className={styles.loadingHint}>Ainda não disponível. Tente recalcular em instantes.</p>
          <button onClick={onReset} className={styles.primaryButton} disabled={isResetting}>
            Recalcular
          </button>
        </div>
      )}

      {!archetypeParseError && archetypeData && (
        <div className={styles.sectionBlock}>
          <h3>{archetypeData.archetype_title || 'Arquétipo do Dia de Nascimento'}</h3>

          {!hasStructuredArchetype && renderFormattedText(archetypeData.archetype_description)}

          {hasStructuredArchetype && (
            <div className={styles.archetypeGridContainer}>
              <div className={styles.archetypeMain}>
                {archetypeData.archetype_description && (
                  <article className={styles.deepDiveCard}>
                    <p className={styles.deepDiveTitle}>Arquétipo central</p>
                    {renderFormattedText(archetypeData.archetype_description)}
                  </article>
                )}
                {archetypeData.numerology_details && (
                  <article className={styles.deepDiveCard}>
                    <p className={styles.deepDiveTitle}>Numerologia e planetas</p>
                    {renderFormattedText(archetypeData.numerology_details)}
                  </article>
                )}
                {archetypeData.tarot_card && (
                  <article className={styles.deepDiveCard}>
                    <p className={styles.deepDiveTitle}>Correspondência no Tarot</p>
                    {renderFormattedText(archetypeData.tarot_card)}
                  </article>
                )}
              </div>

              <div className={styles.archetypeSidebar}>
                {archetypeData.advice && (
                  <div className={styles.radarCard}>
                    <h4>Conselho</h4>
                    {renderFormattedText(archetypeData.advice)}
                  </div>
                )}
                {archetypeData.strengths?.length > 0 && (
                  <div className={styles.radarCard}>
                    <h4>Pontos fortes</h4>
                    <ul>
                      {archetypeData.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {archetypeData.weaknesses?.length > 0 && (
                  <div className={styles.radarCard}>
                    <h4>Pontos de atenção</h4>
                    <ul>
                      {archetypeData.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Ações ── */}
      <div className={styles.statusRow}>
        <Link to="/oraculo/geral" className={styles.primaryButton}>Ver Síntese Integrada →</Link>
        <button onClick={onReset} className={styles.secondaryButton} disabled={isResetting}>
          {isResetting ? 'Apagando...' : 'Refazer leitura'}
        </button>
      </div>

      {errorResetting && (
        <p className={styles.inlineError}>Erro ao apagar: {errorResetting.message}</p>
      )}
    </div>
  );
}

export default NumerologyResults;
