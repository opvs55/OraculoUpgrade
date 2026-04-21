// src/hooks/useReadings.js (VERSÃO FINAL CORRIGIDA)

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { sortearCruzCelta, sortearTresCartas, sortearUmaCarta, sortearTemploDeAfrodite, sortearEscolhaDeCaminho } from '../services/tarotService';
import { getInterpretation } from '../services/aiService';

const READINGS_PER_PAGE = 12;

const normalizeCommunityReading = (row) => ({
  ...row,
  profiles: {
    username: row.username || null,
    avatar_url: row.avatar_url || null,
  },
  stars: [{ count: Number(row.star_count || 0) }],
  comments: [{ count: Number(row.comment_count || 0) }],
});

// --- FEED DA COMUNIDADE (RPC NO SUPABASE) ---
export function usePublicReadings({
  sort = 'recent',
  weekRef = null,
  objective = '',
  spreadType = '',
  onlyWithPrompt = false,
  feedMode = 'general',
} = {}) {
  const effectiveWeekRef = feedMode === 'general' ? null : weekRef;
  const queryKey = ['publicReadings', { sort, effectiveWeekRef, objective, spreadType, onlyWithPrompt, feedMode }];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const { data: rpcData, error } = await supabase.rpc('community_feed', {
        p_week_ref: effectiveWeekRef,
        p_objective: objective || null,
        p_spread_type: spreadType || null,
        p_only_with_prompt: Boolean(onlyWithPrompt),
        p_sort: sort,
        p_page: pageParam,
        p_page_size: READINGS_PER_PAGE,
      });
      if (error) throw error;

      const rows = Array.isArray(rpcData) ? rpcData.map(normalizeCommunityReading) : [];
      const filteredRows = rows.filter((reading) => {
        const tags = Array.isArray(reading.tags) ? reading.tags : [];
        if (feedMode === 'ritual' && effectiveWeekRef) return tags.includes(`ritual:${effectiveWeekRef}`);
        if (feedMode === 'integrated' && effectiveWeekRef) {
          return tags.includes('integrada') || tags.includes(`integrada:${effectiveWeekRef}`);
        }
        return true;
      });

      return {
        data: filteredRows,
        rawLength: rows.length,
        totalCount: rows[0]?.total_count ?? 0,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedRaw = allPages.reduce((sum, page) => sum + (page.rawLength || 0), 0);
      if (lastPage.totalCount && loadedRaw < lastPage.totalCount) {
        return allPages.length;
      }
      if (!lastPage.totalCount && lastPage.rawLength === READINGS_PER_PAGE) {
        return allPages.length;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  return {
    pages: data?.pages || [],
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

export function useCommunityWeeklyAggregates(weekRef) {
  return useQuery({
    queryKey: ['community', 'weekly-aggregates', weekRef],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('community_weekly_aggregates', {
        p_week_ref: weekRef || null,
        p_objectives_limit: 5,
      });
      if (error) throw error;
      return Array.isArray(data) ? data[0] || null : null;
    },
  });
}

export function useCommunityTrendingTopics(weekRef) {
  return useQuery({
    queryKey: ['community', 'trending-topics', weekRef],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('community_trending_topics', {
        p_week_ref: weekRef || null,
        p_limit: 8,
      });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCommunityTopReadings(weekRef, limit = 5) {
  return useQuery({
    queryKey: ['community', 'top-readings', weekRef, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('community_top_readings', {
        p_week_ref: weekRef || null,
        p_limit: limit,
      });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCommunityTopAuthors(weekRef, limit = 5) {
  return useQuery({
    queryKey: ['community', 'top-authors', weekRef, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('community_top_authors', {
        p_week_ref: weekRef || null,
        p_limit: limit,
      });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCommunityProfileReputation(profileId) {
  return useQuery({
    queryKey: ['community', 'profile-reputation', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data, error } = await supabase.rpc('community_profile_reputation', {
        p_profile_id: profileId,
      });
      if (error) throw error;
      return Array.isArray(data) ? data[0] || null : null;
    },
    enabled: !!profileId,
  });
}

export function useCommunityLeaderboardAuthors({ period = 'weekly', weekRef = null, objective = '', limit = 20 } = {}) {
  return useQuery({
    queryKey: ['community', 'leaderboard', 'authors', { period, weekRef, objective, limit }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('community_leaderboard_authors', {
        p_period: period,
        p_week_ref: period === 'weekly' ? (weekRef || null) : null,
        p_objective: objective || null,
        p_limit: limit,
      });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCommunityLeaderboardReadings({ period = 'weekly', weekRef = null, objective = '', limit = 20 } = {}) {
  return useQuery({
    queryKey: ['community', 'leaderboard', 'readings', { period, weekRef, objective, limit }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('community_leaderboard_readings', {
        p_period: period,
        p_week_ref: period === 'weekly' ? (weekRef || null) : null,
        p_objective: objective || null,
        p_limit: limit,
      });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });
}

// --- SUAS FUNÇÕES EXISTENTES (INTACTAS) ---

export function useReadingsHistory(userId) {
  return useQuery({
    queryKey: ['readings', 'history', userId],
    queryFn: async () => {
      if (!userId) return []; 
      const { data, error } = await supabase
        .from('readings')
        .select('id, created_at, question, spread_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar histórico:", error);
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
      }
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useSingleReading(readingId) {
  const isTemporaryId = readingId?.startsWith('temp-');
  return useQuery({
    queryKey: ['readings', 'detail', readingId],
    queryFn: async () => {
      if (isTemporaryId) {
          console.warn("useSingleReading: Tentativa de buscar leitura temporária por ID ignorada:", readingId);
          return null; 
      }
      if (!readingId) return null;
      const { data, error } = await supabase
        .from('readings')
        .select(`*, profiles ( username, avatar_url )`)
        .eq('id', readingId)
        .single();
      if (error && error.code === 'PGRST116'){
          console.warn("Leitura não encontrada no banco:", readingId);
          throw new Error('Leitura não encontrada.');
      } else if (error) {
        console.error("Erro ao buscar leitura única:", error);
        throw new Error(`Erro ao buscar leitura: ${error.message}`);
      }
      return data;
    },
    enabled: !!readingId && !isTemporaryId, 
    retry: (failureCount, error) => {
        if (error.message === 'Leitura não encontrada.') return false;
        return failureCount < 3;
    }
  });
}

export function useGenerateReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ question, user, spreadType }) => {
      let cards;
      switch (spreadType) {
        case 'threeCards': cards = sortearTresCartas(); break;
        case 'oneCard': cards = sortearUmaCarta(); break;
        case 'templeOfAphrodite': cards = sortearTemploDeAfrodite(); break;
        case 'pathChoice': cards = sortearEscolhaDeCaminho(); break;
        case 'celticCross': default: cards = sortearCruzCelta(); break;
      }
      const apiResponse = await getInterpretation(question, cards, spreadType);
      if (user && user.id) { 
        const dataToInsert = {
          user_id: user.id, 
          question,
          cards_data: cards,
          spread_type: spreadType,
          interpretation_data: apiResponse, 
          is_public: false,
        };
        if (apiResponse.interpretationType === 'simple') {
          dataToInsert.main_interpretation = apiResponse.data.mainInterpretation;
          dataToInsert.card_interpretations = apiResponse.data.cardInterpretations;
        }
        const { data: newReading, error: insertError } = await supabase
          .from('readings')
          .insert(dataToInsert)
          .select()
          .single();
        if (insertError) {
            console.error("[useGenerateReading] Erro Supabase ao INSERIR leitura:", insertError);
            throw new Error(`Erro ao salvar leitura: ${insertError.message}`); 
        }
        return newReading;
      } else {
        const temporaryReading = {
          id: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`, 
          created_at: new Date().toISOString(),
          question: question,
          cards_data: cards,
          spread_type: spreadType,
          interpretation_data: apiResponse,
          is_public: false,
          user_id: null,
          ...(apiResponse.interpretationType === 'simple' && {
              main_interpretation: apiResponse.data.mainInterpretation,
              card_interpretations: apiResponse.data.cardInterpretations
          })
        };
        return temporaryReading;
      }
    },
    onSuccess: (data, variables) => {
      if (data.user_id && variables.user?.id) { 
        queryClient.invalidateQueries({ queryKey: ['readings', 'history', variables.user.id] });
      }
    },
    onError: (error) => {
        console.error("Erro capturado em onError [useGenerateReading]:", error);
        throw error; 
    }
  });
}

export function useUpdateDidacticCache() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ readingId, updatedInterpretations }) => {
      if (readingId?.startsWith('temp-')) {
          return;
      }
      const { error } = await supabase
        .from('readings')
        .update({ didactic_interpretations: updatedInterpretations })
        .eq('id', readingId);
      if (error) {
          console.error("Erro ao atualizar cache didático no Supabase:", error);
          throw new Error(`Erro ao salvar cache didático: ${error.message}`);
      }
    },
    onSuccess: (data, variables) => {
       if (!variables.readingId?.startsWith('temp-')) {
           queryClient.invalidateQueries({ queryKey: ['readings', 'detail', variables.readingId] });
       }
    },
    onError: (error) => {
        console.error("Erro na mutação useUpdateDidacticCache:", error);
    }
  });
}
