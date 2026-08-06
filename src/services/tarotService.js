// src/services/tarotService.js (VERSÃO REFATORADA)

import { baralhoDetalhado as baralho } from '../tarotDeck.js';
import { POSICOES_TEMPLO_AFRODITE, POSICOES_ESCOLHA_CAMINHO } from '../constants/tarotConstants.js';

// Função para embaralhar um array usando o algoritmo Fisher-Yates
function embaralhar(array) {
  const shuffled = [...array]; // Cria uma cópia para não modificar o original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função auxiliar para pegar cartas
function getShuffledCards(count) {
  const baralhoEmbaralhado = embaralhar(baralho);
  return baralhoEmbaralhado.slice(0, count);
}

// Função auxiliar para atribuir inversão (para não repetir código)
function assignInversion(card) {
  return { ...card, invertida: Math.random() < 0.5 };
}

// --- Funções de Sorteio com a Posição Adicionada ---

export function sortearUmaCarta() {
  console.log("Serviço de tarot: Sorteando 1 carta...");
  const [carta] = getShuffledCards(1);
  return [{ ...assignInversion(carta), posicao: 'A Carta' }];
}

export function sortearTresCartas() {
  console.log("Serviço de tarot: Sorteando 3 cartas...");
  const [passado, presente, futuro] = getShuffledCards(3);
  return [
    { ...assignInversion(passado), posicao: 'Passado' },
    { ...assignInversion(presente), posicao: 'Presente' },
    { ...assignInversion(futuro), posicao: 'Futuro' },
  ];
}

export function sortearCruzCelta() {
  console.log("Serviço de tarot: Sorteando 10 cartas para a Cruz Celta...");
  const sorteadas = getShuffledCards(10);
  // Mantido em sincronia com POSICOES_CRUZ_CELTA (constants/tarotConstants.js)
  // e com os rótulos "posicao" gerados pelo prompt da IA no backend.
  const posicoes = [
    'O Coração da Matéria', 'O Desafio Imediato', 'A Base da Questão', 'O Passado Distante',
    'O Objetivo', 'O Caminho', 'O Consulente',
    'O Ambiente', 'Esperanças e Medos', 'O Resultado Final'
  ];
  return sorteadas.map((carta, index) => ({
    ...assignInversion(carta),
    posicao: posicoes[index],
  }));
}

export function sortearTemploDeAfrodite() {
  console.log("Serviço de tarot: Sorteando 7 cartas para o Templo de Afrodite...");
  const sorteadas = getShuffledCards(7);
  // Mesma fonte que TempleOfAphroditeLayout usa pra rotular o grid — evita
  // que essa carta carregue um "posicao" que já nasce dessincronizado.
  return sorteadas.map((carta, index) => ({
      ...assignInversion(carta),
      posicao: POSICOES_TEMPLO_AFRODITE[index],
  }));
}

export function sortearEscolhaDeCaminho() {
  console.log("Serviço de tarot: Sorteando 8 cartas para a Escolha de Caminho...");
  const sorteadas = getShuffledCards(8);
  // 4 posições, aplicadas duas vezes (Caminho 1 e Caminho 2) — mesma fonte
  // que PathChoiceLayout usa pro grid.
  return sorteadas.map((carta, index) => ({
      ...assignInversion(carta),
      posicao: POSICOES_ESCOLHA_CAMINHO[index % 4],
  }));
}