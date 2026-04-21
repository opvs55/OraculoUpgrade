// src/components/numerology/NumerologyForm.jsx (NOVO COMPONENTE)
import React from 'react';
import styles from '../../pages/NumerologyPage.module.css'; // Reutiliza os estilos da página

// Este é um "componente burro", apenas recebe props e renderiza o form
const currentYear = new Date().getFullYear();

function NumerologyForm({
  birthDate,
  setBirthDate,
  formError,
  handleSubmit,
  isCalculating,
  isSuccessResetting
}) {
  return (
    <div className={styles.formWrapper}>
      {!isSuccessResetting && (
        <div className={styles.messageCard}>
          <h2>O que você vai receber</h2>
          <ul className={styles.formContextList}>
            <li>✦ Seu <strong>Número do Caminho de Vida</strong> com interpretação completa</li>
            <li>◎ <strong>Arcano pessoal e Arcano do Ano</strong> — as cartas que regem sua jornada</li>
            <li>◎ <strong>Arquétipo do Dia de Nascimento</strong> com pontos fortes e correspondência no Tarot</li>
            <li>⊕ <strong>Vibração semanal</strong> para guiar decisões desta semana</li>
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.numerologyForm}>
        <label htmlFor="birthDate" className={styles.dateLabel}>
          {isSuccessResetting ? "Insira sua data correta para recalcular:" : "Data de Nascimento"}
        </label>
        <input
          type="date"
          id="birthDate"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={styles.dateInput}
          required
          min="1900-01-01"
          max={`${currentYear}-12-31`}
          disabled={isCalculating}
        />
        <button
          type="submit"
          disabled={isCalculating}
          className={styles.primaryButton}
        >
          {isCalculating ? 'Calculando...' : 'Revelar meus Números'}
        </button>
        {formError && <p className={styles.inlineError}>{formError}</p>}
      </form>
    </div>
  );
}

export default NumerologyForm;