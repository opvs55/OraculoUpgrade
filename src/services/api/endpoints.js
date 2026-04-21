const endpointConfig = {
  tarotReadings: {
    v1: '/api/v1/tarot/readings',
    legacy: '/api/tarot',
    fallback: true,
  },
  tarotChat: {
    v1: '/api/v1/tarot/chat',
    legacy: '/api/tarot/chat',
    fallback: true,
  },
  tarotCardMeaning: {
    v1: '/api/v1/tarot/cards/meaning',
    legacy: '/api/tarot/card-meaning',
    fallback: true,
  },
  numerologyPersonal: {
    v1: '/api/v1/numerology/personal',
    legacy: '/api/numerology',
    fallback: true,
  },
  numerologyWeekly: {
    v1: '/api/v1/numerology/weekly',
  },
  centralRequirements: {
    v1: '/api/v1/oracles/central/requirements',
  },
  centralGenerate: {
    v1: '/api/v1/oracles/central/generate',
  },
  unifiedReadingsMe: {
    v1: '/api/v1/unified-readings/me',
  },
  unifiedReadingsV2: {
    v1: '/api/v1/unified-readings',
  },
  runesReadings: {
    v1: '/api/v1/oracles/runes/readings',
  },
  runesWeeklyGenerate: {
    v1: '/api/v1/oracles/runes/weekly/generate',
  },
  runesWeeklyMe: {
    v1: '/api/v1/oracles/runes/weekly/me',
  },
  iChingReadings: {
    v1: '/api/v1/oracles/iching/readings',
  },
  ichingWeeklyGenerate: {
    v1: '/api/v1/oracles/iching/weekly/generate',
  },
  ichingWeeklyMe: {
    v1: '/api/v1/oracles/iching/weekly/me',
  },
  unifiedReadings: {
    v1: '/api/v1/unified/readings',
  },
  readingQueueJoin: {
    v1: '/api/v1/readings/queue/join',
  },
  readingQueueLeave: {
    v1: '/api/v1/readings/queue/leave',
  },
  readingQueueStatus: {
    v1: '/api/v1/readings/queue/status',
  },
  readingMatchAccept: {
    v1: '/api/v1/readings/match/accept',
  },
  readingSessions: {
    v1: '/api/v1/readings/sessions',
  },
  readingHistory: {
    v1: '/api/v1/readings/history',
  },
  readingShareBase: {
    v1: '/api/v1/readings/shares',
  },
  publicReadingBase: {
    v1: '/api/public/readings',
  },
  dailyOracle: {
    v1: '/api/v1/features/daily-oracle',
  },
  yearMap: {
    v1: '/api/v1/features/year-map',
  },
  numerologyCompatibility: {
    v1: '/api/v1/features/numerology/compatibility',
  },
  numerologyTransits: {
    v1: '/api/v1/features/numerology/transits',
  },
  ichingActive: {
    v1: '/api/v1/features/iching/active',
  },
};

export const API_V1_ENDPOINTS = Object.fromEntries(
  Object.entries(endpointConfig).map(([key, value]) => [key, value.v1]),
);

export function resolveEndpointSequence(key) {
  const config = endpointConfig[key];

  if (!config) {
    throw new Error(`Endpoint não mapeado: ${key}`);
  }

  return [config.v1, ...(config.fallback && config.legacy ? [config.legacy] : [])];
}
