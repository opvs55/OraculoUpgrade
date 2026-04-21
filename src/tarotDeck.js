// src/tarotDeck.js
// Baralho completo de Tarot - Versão modularizada

import { arcanosMaiores } from './data/arcanosMaiores.js';
import { arcanosMaioresContinuacao } from './data/arcanosMaioresContinuacao.js';
import { arcanosMaioresFinal } from './data/arcanosMaioresFinal.js';
import { arcanosMenores } from './data/arcanosMenores.js';

// Combina todos os arcanos maiores
const todosArcanosMaiores = [
  ...arcanosMaiores,
  ...arcanosMaioresContinuacao,
  ...arcanosMaioresFinal
];

// Combina todos os arcanos menores
const todosArcanosMenores = [
  ...arcanosMenores.Paus,
  ...arcanosMenores.Copas,
  ...arcanosMenores.Espadas,
  ...arcanosMenores.Ouros
];

// Baralho completo
export const baralhoDetalhado = [
  ...todosArcanosMaiores,
  ...todosArcanosMenores
];

// Exportações individuais para uso específico
export { 
  todosArcanosMaiores as arcanosMaiores,
  todosArcanosMenores as arcanosMenores
};

// Utilitários para busca
export const buscarCartaPorId = (id) => {
  return baralhoDetalhado.find(carta => carta.id === id);
};

export const buscarCartaPorSlug = (slug) => {
  return baralhoDetalhado.find(carta => carta.slug === slug);
};

export const buscarCartasPorNaipe = (naipe) => {
  return baralhoDetalhado.filter(carta => carta.naipe === naipe);
};

export const buscarArcanosMaiores = () => {
  return baralhoDetalhado.filter(carta => carta.tipo === 'Arcano Maior');
};

export const buscarArcanosMenores = () => {
  return baralhoDetalhado.filter(carta => carta.tipo === 'Arcano Menor');
};
