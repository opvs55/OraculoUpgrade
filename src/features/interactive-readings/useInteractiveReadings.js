import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interactiveReadingsApi } from '../../services/api/interactiveReadingsApi';

const POLL_MS = 5000;

const unwrap = (payload) => payload?.data?.data ?? payload?.data ?? payload ?? null;

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [];
};

const normalizeQueue = (payload) => {
  const root = unwrap(payload);
  if (!root) return null;
  return root.queue || root.status || root;
};

const isQueueEndpointUnavailable = (error) => error?.status === 404;

const normalizeSession = (payload) => {
  const root = unwrap(payload);
  const session = root?.session || root || {};
  const participants = toArray(root?.participants || session?.participants);
  const draws = toArray(root?.draws || session?.draws || root?.cards);

  return {
    ...session,
    participants,
    draws,
  };
};

const normalizeMessages = (payload) => {
  const root = unwrap(payload);
  const rows = toArray(root?.messages || root?.items || root);
  return rows.map((row, index) => ({
    id: row.id || `message-${index}`,
    kind: row.kind || 'text',
    content: row.content || row.text || '',
    senderUserId: row.sender_user_id || row.senderUserId || null,
    createdAt: row.created_at || row.createdAt || null,
  }));
};

const normalizeHistory = (payload) => {
  const root = unwrap(payload);
  const rows = toArray(root?.items || root?.history || root);
  return rows.map((row) => ({
    ...row,
    id: row.id || row.session_id,
    sessionId: row.session_id || row.sessionId || row.id,
    summary: row.summary || row.title || 'Leitura interativa',
    createdAt: row.created_at || row.createdAt || row.started_at || null,
    shares: toArray(row.shares),
  }));
};

export function useInteractiveQueue(userId) {
  const queryClient = useQueryClient();

  const queueQuery = useQuery({
    queryKey: ['interactive-readings', 'queue-status', userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        return normalizeQueue(await interactiveReadingsApi.getQueueStatus());
      } catch (error) {
        if (isQueueEndpointUnavailable(error)) {
          return null;
        }
        throw error;
      }
    },
    refetchInterval: POLL_MS,
  });

  const joinQueueMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.joinQueue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive-readings', 'queue-status', userId] });
    },
  });

  const leaveQueueMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.leaveQueue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactive-readings', 'queue-status', userId] });
    },
  });

  const matchedSessionId = useMemo(() => {
    const queue = queueQuery.data;
    return (
      queue?.matched_session_id
      || queue?.matchedSessionId
      || queue?.session_id
      || queue?.sessionId
      || queue?.match?.session_id
      || null
    );
  }, [queueQuery.data]);

  return {
    queue: queueQuery.data,
    isLoadingQueue: queueQuery.isLoading,
    errorQueue: queueQuery.error,
    isJoiningQueue: joinQueueMutation.isPending,
    isLeavingQueue: leaveQueueMutation.isPending,
    joinQueue: joinQueueMutation.mutateAsync,
    leaveQueue: leaveQueueMutation.mutateAsync,
    matchedSessionId,
  };
}

export function useInteractiveSession(sessionId, userId) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ['interactive-readings', 'session', sessionId],
    enabled: !!sessionId && !!userId,
    queryFn: async () => normalizeSession(await interactiveReadingsApi.getSessionById(sessionId)),
    refetchInterval: POLL_MS,
  });

  const messagesQuery = useQuery({
    queryKey: ['interactive-readings', 'session-messages', sessionId],
    enabled: !!sessionId && !!userId,
    queryFn: async () => normalizeMessages(await interactiveReadingsApi.listMessages(sessionId)),
    refetchInterval: 3000,
  });

  const invalidateSession = () => {
    queryClient.invalidateQueries({ queryKey: ['interactive-readings', 'session', sessionId] });
    queryClient.invalidateQueries({ queryKey: ['interactive-readings', 'session-messages', sessionId] });
  };

  const sendMessageMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.sendMessage(sessionId, payload),
    onSuccess: invalidateSession,
  });

  const drawCardMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.drawCard(sessionId, payload),
    onSuccess: invalidateSession,
  });

  const aiAssistMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.requestAiAssist(sessionId, payload),
    onSuccess: invalidateSession,
  });

  const endRequestMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.endRequest(sessionId, payload),
    onSuccess: invalidateSession,
  });

  const endConfirmMutation = useMutation({
    mutationFn: (payload) => interactiveReadingsApi.endConfirm(sessionId, payload),
    onSuccess: invalidateSession,
  });

  return {
    session: sessionQuery.data,
    messages: messagesQuery.data || [],
    isLoadingSession: sessionQuery.isLoading || messagesQuery.isLoading,
    errorSession: sessionQuery.error || messagesQuery.error,
    refreshSession: invalidateSession,
    sendMessage: sendMessageMutation.mutateAsync,
    drawCard: drawCardMutation.mutateAsync,
    requestAiAssist: aiAssistMutation.mutateAsync,
    endRequest: endRequestMutation.mutateAsync,
    endConfirm: endConfirmMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
    isDrawingCard: drawCardMutation.isPending,
    isAiLoading: aiAssistMutation.isPending,
    isEndingRequest: endRequestMutation.isPending,
    isEndingConfirm: endConfirmMutation.isPending,
  };
}

export function useInteractiveHistory(userId) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['interactive-readings', 'history', userId],
    enabled: !!userId,
    queryFn: async () => normalizeHistory(await interactiveReadingsApi.listHistory()),
  });

  const refreshHistory = () => {
    queryClient.invalidateQueries({ queryKey: ['interactive-readings', 'history', userId] });
  };

  const createShareMutation = useMutation({
    mutationFn: ({ sessionId, payload }) => interactiveReadingsApi.createPublicShare(sessionId, payload),
    onSuccess: refreshHistory,
  });

  const updateShareMutation = useMutation({
    mutationFn: ({ shareId, payload }) => interactiveReadingsApi.updatePublicShare(shareId, payload),
    onSuccess: refreshHistory,
  });

  const revokeShareMutation = useMutation({
    mutationFn: ({ shareId }) => interactiveReadingsApi.revokePublicShare(shareId),
    onSuccess: refreshHistory,
  });

  return {
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    errorHistory: historyQuery.error,
    createShare: createShareMutation.mutateAsync,
    updateShare: updateShareMutation.mutateAsync,
    revokeShare: revokeShareMutation.mutateAsync,
    isCreatingShare: createShareMutation.isPending,
    isUpdatingShare: updateShareMutation.isPending,
    isRevokingShare: revokeShareMutation.isPending,
  };
}
