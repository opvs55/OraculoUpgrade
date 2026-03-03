import { supabase } from '../../supabaseClient';
import { requestApi } from './client';
import { API_V1_ENDPOINTS, resolveEndpointSequence } from './endpoints';

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : {};
}

async function postJson(endpointKey, payload, { withAuth = false } = {}) {
  const authHeaders = withAuth ? await getAuthHeaders() : {};

  return requestApi(resolveEndpointSequence(endpointKey), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });
}

export const oraclesApi = {
  createTarotReading(payload) {
    return postJson('tarotReadings', payload);
  },

  chatTarot(payload) {
    return postJson('tarotChat', payload);
  },

  getTarotCardMeaning(payload) {
    return postJson('tarotCardMeaning', payload);
  },

  getPersonalNumerology(payload) {
    return postJson('numerologyPersonal', payload, { withAuth: true });
  },

  getWeeklyNumerology(payload) {
    return postJson('numerologyWeekly', payload, { withAuth: true });
  },

  getRunesReading(payload) {
    return postJson('runesReadings', payload, { withAuth: true });
  },

  generateRunesWeekly(payload = {}) {
    return postJson('runesWeeklyGenerate', payload, { withAuth: true });
  },

  async getMyRunesWeekly() {
    return requestApi(resolveEndpointSequence('runesWeeklyMe'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
  },

  getIChingReading(payload) {
    return postJson('iChingReadings', payload, { withAuth: true });
  },

  generateIChingWeekly(payload = {}) {
    return postJson('ichingWeeklyGenerate', payload, { withAuth: true });
  },

  async getMyIChingWeekly() {
    return requestApi(resolveEndpointSequence('ichingWeeklyMe'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
  },

  createUnifiedReading(payload) {
    return postJson('unifiedReadings', payload, { withAuth: true });
  },

  async getCentralRequirements() {
    return requestApi(resolveEndpointSequence('centralRequirements'), {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
  },

  generateCentralReading(payload) {
    return postJson('centralGenerate', payload, { withAuth: true });
  },

  async getUnifiedReadings(params = {}) {
    const authHeaders = await getAuthHeaders();
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_V1_ENDPOINTS.unifiedReadingsMe}${query ? `?${query}` : ''}`;

    return requestApi(endpoint, {
      method: 'GET',
      headers: authHeaders,
    });
  },

  async getUnifiedReadingById(readingId) {
    return requestApi(`${API_V1_ENDPOINTS.unifiedReadingsV2}/${readingId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
  },
};
