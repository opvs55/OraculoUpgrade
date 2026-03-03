const RUNE_DATA = {
  fehu: { symbol: 'ᚠ', name: 'Fehu', keywords: ['prosperidade', 'recursos', 'fluxo'] },
  uruz: { symbol: 'ᚢ', name: 'Uruz', keywords: ['força', 'vitalidade', 'coragem'] },
  thurisaz: { symbol: 'ᚦ', name: 'Thurisaz', keywords: ['proteção', 'limites', 'ruptura'] },
  ansuz: { symbol: 'ᚨ', name: 'Ansuz', keywords: ['mensagem', 'intuição', 'sabedoria'] },
  raidho: { symbol: 'ᚱ', name: 'Raidho', keywords: ['caminho', 'movimento', 'ritmo'] },
  kenaz: { symbol: 'ᚲ', name: 'Kenaz', keywords: ['clareza', 'foco', 'transformação'] },
  gebo: { symbol: 'ᚷ', name: 'Gebo', keywords: ['troca', 'parceria', 'equilíbrio'] },
  wunjo: { symbol: 'ᚹ', name: 'Wunjo', keywords: ['alegria', 'harmonia', 'bem-estar'] },
  hagalaz: { symbol: 'ᚺ', name: 'Hagalaz', keywords: ['mudança', 'desafio', 'despertar'] },
  naudhiz: { symbol: 'ᚾ', name: 'Nauthiz', keywords: ['necessidade', 'resiliência', 'disciplina'] },
  isa: { symbol: 'ᛁ', name: 'Isa', keywords: ['pausa', 'silêncio', 'observação'] },
  jera: { symbol: 'ᛃ', name: 'Jera', keywords: ['colheita', 'ciclos', 'resultado'] },
  eihwaz: { symbol: 'ᛇ', name: 'Eihwaz', keywords: ['eixo', 'persistência', 'renovação'] },
  perthro: { symbol: 'ᛈ', name: 'Perthro', keywords: ['mistério', 'destino', 'revelação'] },
  algiz: { symbol: 'ᛉ', name: 'Algiz', keywords: ['amparo', 'proteção', 'ampliação'] },
  sowilo: { symbol: 'ᛋ', name: 'Sowilo', keywords: ['sucesso', 'energia', 'direção'] },
  tiwaz: { symbol: 'ᛏ', name: 'Tiwaz', keywords: ['justiça', 'honra', 'propósito'] },
  berkano: { symbol: 'ᛒ', name: 'Berkano', keywords: ['nascimento', 'cuidado', 'crescimento'] },
  ehwaz: { symbol: 'ᛖ', name: 'Ehwaz', keywords: ['progresso', 'confiança', 'parceria'] },
  mannaz: { symbol: 'ᛗ', name: 'Mannaz', keywords: ['comunidade', 'consciência', 'cooperação'] },
  laguz: { symbol: 'ᛚ', name: 'Laguz', keywords: ['emoção', 'fluxo', 'sensibilidade'] },
  ingwaz: { symbol: 'ᛜ', name: 'Ingwaz', keywords: ['gestação', 'potencial', 'integração'] },
  dagaz: { symbol: 'ᛞ', name: 'Dagaz', keywords: ['virada', 'clareza', 'renascimento'] },
  othala: { symbol: 'ᛟ', name: 'Othala', keywords: ['ancestralidade', 'legado', 'pertencimento'] },
};

const stripAccents = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const sanitizeAlpha = (value = '') => stripAccents(value).toLowerCase().replace(/[^a-z]/g, '');

const SYMBOL_TO_KEY = Object.entries(RUNE_DATA).reduce((acc, [key, rune]) => {
  acc[rune.symbol] = key;
  return acc;
}, {});

export const RUNES = RUNE_DATA;

export const normalizeRuneKey = (input) => {
  if (!input) return null;

  if (typeof input === 'object') {
    return normalizeRuneKey(input.key || input.name || input.nome || input.symbol || input.unicode || input.glyph);
  }

  const raw = String(input).trim();
  if (!raw) return null;

  if (SYMBOL_TO_KEY[raw]) return SYMBOL_TO_KEY[raw];

  const normalized = sanitizeAlpha(raw);
  if (!normalized) return null;

  const direct = Object.keys(RUNE_DATA).find((key) => sanitizeAlpha(key) === normalized);
  if (direct) return direct;

  return (
    Object.entries(RUNE_DATA).find(([, rune]) => sanitizeAlpha(rune.name) === normalized)?.[0] ||
    null
  );
};

export const resolveRune = (input) => {
  const key = normalizeRuneKey(input);

  if (!key) {
    if (typeof input === 'object' && input) {
      const fallbackSymbol = input.symbol || input.unicode || input.glyph || 'ᛟ';
      const fallbackName = input.name || input.nome || null;
      const fallbackKeywords = Array.isArray(input.keywords) ? input.keywords.filter(Boolean).slice(0, 3) : [];
      return { key: null, symbol: fallbackSymbol, name: fallbackName, keywords: fallbackKeywords };
    }

    if (typeof input === 'string' && input.trim()) {
      const text = input.trim();
      const isSymbol = /^[\u16A0-\u16FF]$/.test(text);
      return { key: null, symbol: isSymbol ? text : text.charAt(0).toUpperCase(), name: isSymbol ? null : text, keywords: [] };
    }

    return { key: null, symbol: 'ᛟ', name: null, keywords: [] };
  }

  return { key, ...RUNE_DATA[key] };
};
