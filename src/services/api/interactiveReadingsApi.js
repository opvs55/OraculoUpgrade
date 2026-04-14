import { supabase } from '../../supabaseClient';
import { requestApi } from './client';
import { API_V1_ENDPOINTS } from './endpoints';

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

async function get(url) {
  return requestApi(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });
}

async function post(url, payload = {}) {
  return requestApi(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });
}

async function patch(url, payload = {}) {
  return requestApi(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });
}

async function remove(url) {
  return requestApi(url, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
}

const sessionsBase = API_V1_ENDPOINTS.readingSessions;
const historyBase = API_V1_ENDPOINTS.readingHistory;

export const interactiveReadingsApi = {
  joinQueue(payload) {
    return post(API_V1_ENDPOINTS.readingQueueJoin, payload);
  },

  leaveQueue(payload) {
    return post(API_V1_ENDPOINTS.readingQueueLeave, payload);
  },

  getQueueStatus() {
    return get(API_V1_ENDPOINTS.readingQueueStatus);
  },

  acceptMatch(payload) {
    return post(API_V1_ENDPOINTS.readingMatchAccept, payload);
  },

  getSessionById(sessionId) {
    return get(`${sessionsBase}/${sessionId}`);
  },

  joinSession(sessionId, payload = {}) {
    return post(`${sessionsBase}/${sessionId}/join`, payload);
  },

  reconnectSession(sessionId, payload = {}) {
    return post(`${sessionsBase}/${sessionId}/reconnect`, payload);
  },

  endRequest(sessionId, payload = {}) {
    return post(`${sessionsBase}/${sessionId}/end-request`, payload);
  },

  endConfirm(sessionId, payload = {}) {
    return post(`${sessionsBase}/${sessionId}/end-confirm`, payload);
  },

  listMessages(sessionId, params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.append(key, String(value));
      }
    });
    const query = search.toString();
    return get(`${sessionsBase}/${sessionId}/messages${query ? `?${query}` : ''}`);
  },

  sendMessage(sessionId, payload) {
    return post(`${sessionsBase}/${sessionId}/messages`, payload);
  },

  drawCard(sessionId, payload) {
    return post(`${sessionsBase}/${sessionId}/draw-card`, payload);
  },

  requestAiAssist(sessionId, payload) {
    return post(`${sessionsBase}/${sessionId}/ai-assist`, payload);
  },

  listHistory(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.append(key, String(value));
      }
    });
    const query = search.toString();
    return get(`${historyBase}${query ? `?${query}` : ''}`);
  },

  getHistoryEntry(sessionId) {
    return get(`${historyBase}/${sessionId}`);
  },

  createPublicShare(sessionId, payload = {}) {
    return post(`${historyBase}/${sessionId}/share`, payload);
  },

  updatePublicShare(shareId, payload = {}) {
    return patch(`${API_V1_ENDPOINTS.readingShareBase}/${shareId}`, payload);
  },

  revokePublicShare(shareId) {
    return remove(`${API_V1_ENDPOINTS.readingShareBase}/${shareId}`);
  },

  getPublicShareBySlug(slug) {
    return requestApi(`${API_V1_ENDPOINTS.publicReadingBase}/${slug}`, {
      method: 'GET',
    });
  },
};
