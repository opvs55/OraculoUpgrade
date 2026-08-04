import { baralho } from '../tarotDeck';

export function resolveTarotCardImage(cardName) {
  return baralho.find((card) => card.nome === cardName)?.img || null;
}
