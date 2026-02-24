import React, { useEffect, useState } from 'react';
import { useNatalChart } from '../features/astrology/useNatalChart';
import styles from './AstrologyPage.module.css';

const defaultFormState = {
  birthDate: '',
  birthTime: '',
  birthCity: '',
  birthCountry: 'Brasil',
  birthTimezone: 'America/Sao_Paulo',
  zodiacSystem: 'tropical',
  houseSystem: 'placidus',
};

function AstrologyPage() {
  const [formData, setFormData] = useState(defaultFormState);
  const [formError, setFormError] = useState('');
  const {
    natalChart,
    isLoadingNatalChart,
    errorNatalChart,
    refetchNatalChart,
    generateNatalChart,
    isGeneratingNatalChart,
    errorGeneratingNatalChart,
  } = useNatalChart();

  useEffect(() => {
    if (!natalChart) return;

    setFormData((prev) => ({
      ...prev,
      birthDate: natalChart.birth_date || prev.birthDate,
      birthTime: natalChart.birth_time || prev.birthTime,
      birthCity: natalChart.birth_city || prev.birthCity,
      birthCountry: natalChart.birth_country || prev.birthCountry,
      birthTimezone: natalChart.birth_timezone || prev.birthTimezone,
      zodiacSystem: natalChart.zodiac_system || prev.zodiacSystem,
      houseSystem: natalChart.house_system || prev.houseSystem,
    }));
  }, [natalChart]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    birth_date: formData.birthDate,
    birth_time: formData.birthTime || null,
    birth_city: formData.birthCity,
    birth_country: formData.birthCountry,
    birth_timezone: formData.birthTimezone,
    zodiac_system: formData.zodiacSystem,
    house_system: formData.houseSystem,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.birthDate || !formData.birthCity || !formData.birthTimezone) {
      setFormError('Informe data, cidade e fuso horário para gerar o mapa astral.');
      return;
    }

    try {
      await generateNatalChart(buildPayload());
    } catch (error) {
      setFormError(error.message || 'Não foi possível salvar o mapa astral.');
    }
  };

  const handleReset = () => {
    setFormData(defaultFormState);
    setFormError('');
  };

  const combinedError = formError || errorNatalChart?.message || errorGeneratingNatalChart?.message;

  return (
    <div className={`content_wrapper ${styles.pageContainer}`}>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Oráculos</p>
          <h1 className={styles.title}>Mapa Astral</h1>
          <p className={styles.subtitle}>
            Salve seus dados natais para enriquecer leituras futuras e gerar sínteses mais precisas.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.field}><span>Data de nascimento</span><input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required /></label>
            <label className={styles.field}><span>Hora de nascimento (opcional)</span><input type="time" name="birthTime" value={formData.birthTime} onChange={handleChange} /></label>
            <label className={styles.field}><span>Cidade de nascimento</span><input type="text" name="birthCity" value={formData.birthCity} onChange={handleChange} required /></label>
            <label className={styles.field}><span>País de nascimento</span><input type="text" name="birthCountry" value={formData.birthCountry} onChange={handleChange} required /></label>
            <label className={styles.field}><span>Fuso horário</span><input type="text" name="birthTimezone" value={formData.birthTimezone} onChange={handleChange} required /></label>
            <label className={styles.field}><span>Sistema zodiacal</span><select name="zodiacSystem" value={formData.zodiacSystem} onChange={handleChange}><option value="tropical">Tropical</option><option value="sidereal">Sideral</option></select></label>
            <label className={styles.field}><span>Sistema de casas</span><select name="houseSystem" value={formData.houseSystem} onChange={handleChange}><option value="placidus">Placidus</option><option value="whole_sign">Whole Sign</option><option value="koch">Koch</option></select></label>
          </div>

          {combinedError && (
            <div className={styles.errorContainer}>
              <p className={styles.error}>{combinedError}</p>
              <button type="button" className={styles.secondaryButton} onClick={() => refetchNatalChart()}>
                Tentar novamente
              </button>
            </div>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={isGeneratingNatalChart}>
              {isGeneratingNatalChart ? 'Salvando mapa...' : 'Salvar mapa astral'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleReset}>
              Limpar
            </button>
          </div>
        </form>

        <section className={styles.resultSection} aria-live="polite">
          {(isGeneratingNatalChart || isLoadingNatalChart) && (
            <div className={styles.loadingCard}>
              <span className={styles.loadingPulse} />
              <p>Carregando seu mapa astral.</p>
            </div>
          )}

          {!isGeneratingNatalChart && natalChart && (
            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <h2>Resumo salvo</h2>
                <p>Dados persistidos no backend do Oráculo Central.</p>
              </div>
              <pre className={styles.resultContent}>{JSON.stringify(natalChart.chart_data || natalChart, null, 2)}</pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AstrologyPage;
