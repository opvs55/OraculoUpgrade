import { baralho } from '../tarotDeck';

// Nomes que o backend já gravou em leituras/mapas antigos mas que não batem
// com o nome canônico no baralho do frontend — sem isso o .find() falha
// silenciosamente e a carta some (imagem e descrição).
const CARD_NAME_ALIASES = {
  'Os Enamorados': 'Os Amantes',
};

export function normalizeCardName(cardName) {
  return CARD_NAME_ALIASES[cardName] || cardName;
}

export function resolveTarotCardImage(cardName) {
  const name = normalizeCardName(cardName);
  return baralho.find((card) => card.nome === name)?.img || null;
}
