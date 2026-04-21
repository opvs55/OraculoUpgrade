// src/types/tarot.js
// Type definitions para o sistema de Tarot

/**
 * @typedef {Object} PalavrasChave
 * @property {string[]} direito - Palavras-chave quando a carta está direita
 * @property {string[]} invertido - Palavras-chave quando a carta está invertida
 */

/**
 * @typedef {Object} Significados
 * @property {string} direito - Significado quando a carta está direita
 * @property {string} invertido - Significado quando a carta está invertida
 */

/**
 * @typedef {Object} Carta
 * @property {number} id - ID único da carta (0-77)
 * @property {string} slug - Slug para URLs
 * @property {string} nome - Nome da carta
 * @property {string} img - Caminho da imagem
 * @property {string} video - Caminho do vídeo
 * @property {string} tipo - "Arcano Maior" ou "Arcano Menor"
 * @property {string|null} naipe - "Paus", "Copas", "Espadas", "Ouros" ou null para Arcanos Maiores
 * @property {string} elemento - Elemento associado (Fogo, Água, Ar, Terra)
 * @property {string} descricao - Descrição detalhada da carta
 * @property {PalavrasChave} palavras_chave - Palavras-chave da carta
 * @property {Significados} significados - Significados da carta
 */

/**
 * @typedef {Object} CartaSorteada
 * @property {Carta} carta - Dados da carta
 * @property {string} posicao - Posição na leitura
 * @property {boolean} invertida - Se a carta está invertida
 */

/**
 * @typedef {Object} Leitura
 * @property {string} id - ID da leitura
 * @property {string} user_id - ID do usuário
 * @property {string} question - Pergunta da leitura
 * @property {string} spread_type - Tipo de spread (celticCross, threeCards, etc.)
 * @property {CartaSorteada[]} cards_data - Cartas sorteadas
 * @property {string} interpretation - Interpretação gerada pela IA
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Data de atualização
 */

/**
 * @typedef {Object} SpreadConfig
 * @property {string} nome - Nome do spread
 * @property {number} numeroCartas - Número de cartas
 * @property {string[]} posicoes - Posições das cartas
 * @property {Function} funcaoSorteio - Função para sortear as cartas
 */

export const TIPOS_CARTA = {
  ARCANO_MAIOR: 'Arcano Maior',
  ARCANO_MENOR: 'Arcano Menor'
};

export const NAIPES = {
  PAUS: 'Paus',
  COPAS: 'Copas',
  ESPADAS: 'Espadas',
  OUROS: 'Ouros'
};

export const ELEMENTOS = {
  FOGO: 'Fogo',
  AGUA: 'Água',
  AR: 'Ar',
  TERRA: 'Terra'
};

export const SPREAD_TYPES = {
  UMA_CARTA: 'umaCarta',
  TRES_CARTAS: 'threeCards',
  CRUZ_CELTA: 'celticCross',
  TEMPLO_AFRODITE: 'temploAfrodite',
  ESCOLHA_CAMINHO: 'escolhaCaminho'
};
