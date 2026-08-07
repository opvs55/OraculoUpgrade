import { supabase } from '../../supabaseClient';
import { requestApi } from './client';
import { API_V1_ENDPOINTS } from './endpoints';

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export const journalApi = {
  async listEntries({ limit = 10, offset = 0 } = {}) {
    const headers = await getAuthHeaders();
    return requestApi(`${API_V1_ENDPOINTS.journalEntries}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers,
    });
  },

  async createEntry(content) {
    const headers = await getAuthHeaders();
    return requestApi(API_V1_ENDPOINTS.journalEntries, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ content }),
    });
  },

  async deleteEntry(id) {
    const headers = await getAuthHeaders();
    return requestApi(`${API_V1_ENDPOINTS.journalEntries}/${id}`, {
      method: 'DELETE',
      headers,
    });
  },

  async reflectOnEntry(id, cardName) {
    const headers = await getAuthHeaders();
    return requestApi(`${API_V1_ENDPOINTS.journalEntries}/${id}/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ cardName }),
    });
  },
};
