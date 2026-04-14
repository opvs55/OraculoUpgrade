import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'tarot_weekly', label: 'Tarot' },
  { value: 'unified_reading', label: 'Síntese' },
  { value: 'runes_weekly', label: 'Runas' },
  { value: 'iching_weekly', label: 'I Ching' },
  { value: 'numerology_weekly', label: 'Numerologia' },
];

const toHeadline = (payload) => (
  payload?.headline
  || payload?.summary
  || payload?.one_liner
  || payload?.weekly_focus
  || ''
);

const toWeekRef = (value) => value || null;

const buildSeedReels = async (userId) => {
  const safeQuery = async (query, fallback = []) => {
    const { data, error } = await query;
    if (error) return fallback;
    return data ?? fallback;
  };

  const [weeklyCards, unifiedReadings, runesModules, ichingModules, numerologyWeekly] = await Promise.all([
    safeQuery(
      supabase
        .from('weekly_cards')
        .select('id, card_name, created_at, week_start')
        .eq('user_id', userId)
        .order('week_start', { ascending: false })
        .limit(12),
    ),
    safeQuery(
      supabase
        .from('unified_readings')
        .select('id, created_at, week_ref, final_reading')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12),
    ),
    safeQuery(
      supabase
        .from('oracle_weekly_modules')
        .select('id, updated_at, week_start, output_payload')
        .eq('user_id', userId)
        .eq('oracle_type', 'runes_weekly')
        .eq('status', 'ok')
        .order('updated_at', { ascending: false })
        .limit(12),
    ),
    safeQuery(
      supabase
        .from('oracle_weekly_modules')
        .select('id, updated_at, week_start, output_payload')
        .eq('user_id', userId)
        .eq('oracle_type', 'iching_weekly')
        .eq('status', 'ok')
        .order('updated_at', { ascending: false })
        .limit(12),
    ),
    safeQuery(
      supabase
        .from('numerology_weekly_readings')
        .select('id, created_at, week_start, week_ref, result_payload')
        .eq('user_id', userId)
        .order('week_start', { ascending: false })
        .limit(12),
    ),
  ]);

  const nowIso = new Date().toISOString();
  const seed = [];

  weeklyCards.forEach((row) => {
    seed.push({
      user_id: userId,
      source_type: 'tarot_weekly',
      source_id: row.id,
      week_ref: toWeekRef(row.week_start),
      title: row.card_name ? `A energia da semana: ${row.card_name}` : 'A energia da sua semana',
      hook: 'Mensagem rápida para alinhar sua semana com o Tarot.',
      description: row.card_name
        ? `Carta da semana: ${row.card_name}. Use este sinal como foco para suas decisões.`
        : 'Use o sinal da sua carta semanal como foco prático para agora.',
      duration_seconds: 22,
      cta_path: '/tarot',
      updated_at: nowIso,
    });
  });

  unifiedReadings.forEach((row) => {
    seed.push({
      user_id: userId,
      source_type: 'unified_reading',
      source_id: row.id,
      week_ref: toWeekRef(row.week_ref),
      title: row.final_reading?.title || 'Síntese da semana',
      hook: row.final_reading?.one_liner || 'Resumo objetivo da combinação dos oráculos.',
      description: 'Visão curta dos sinais centrais para agir com clareza e consistência.',
      duration_seconds: 36,
      cta_path: '/oraculo/geral',
      updated_at: nowIso,
    });
  });

  runesModules.forEach((row) => {
    seed.push({
      user_id: userId,
      source_type: 'runes_weekly',
      source_id: row.id,
      week_ref: toWeekRef(row.week_start),
      title: 'Runas da semana em 30 segundos',
      hook: toHeadline(row.output_payload) || 'Direcionamento simbólico para o ciclo atual.',
      description: 'Leitura rápida dos temas e da melhor postura para atravessar a semana.',
      duration_seconds: 28,
      cta_path: '/runas',
      updated_at: nowIso,
    });
  });

  ichingModules.forEach((row) => {
    seed.push({
      user_id: userId,
      source_type: 'iching_weekly',
      source_id: row.id,
      week_ref: toWeekRef(row.week_start),
      title: 'I Ching semanal em 30 segundos',
      hook: toHeadline(row.output_payload) || 'Clareza estratégica para o próximo passo.',
      description: 'Recorte direto do seu hexagrama para apoiar decisões imediatas.',
      duration_seconds: 30,
      cta_path: '/iching',
      updated_at: nowIso,
    });
  });

  numerologyWeekly.forEach((row) => {
    seed.push({
      user_id: userId,
      source_type: 'numerology_weekly',
      source_id: row.id,
      week_ref: toWeekRef(row.week_ref || row.week_start),
      title: 'Numerologia da semana',
      hook: toHeadline(row.result_payload) || 'Entenda a vibração numerológica do seu ciclo atual.',
      description: 'Vídeo curto com foco energético e direção prática para a semana.',
      duration_seconds: 26,
      cta_path: '/numerologia',
      updated_at: nowIso,
    });
  });

  return seed;
};

const syncReels = async (userId) => {
  const seed = await buildSeedReels(userId);
  if (!seed.length) return;

  const { error } = await supabase
    .from('reels')
    .upsert(seed, { onConflict: 'user_id,source_type,source_id' });

  if (error) throw error;
};

const fetchReelsBundle = async (userId, { autoSync }) => {
  if (autoSync) {
    await syncReels(userId);
  }

  const [reelsRes, favoritesRes, consumptionRes] = await Promise.all([
    supabase
      .from('reels')
      .select('id, source_type, week_ref, title, hook, description, duration_seconds, cta_path, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('reel_favorites')
      .select('reel_id')
      .eq('user_id', userId),
    supabase
      .from('reel_consumption')
      .select('reel_id, view_count, completion_count, total_watch_seconds, last_viewed_at')
      .eq('user_id', userId),
  ]);

  if (reelsRes.error) throw reelsRes.error;
  if (favoritesRes.error) throw favoritesRes.error;
  if (consumptionRes.error) throw consumptionRes.error;

  const favoriteSet = new Set((favoritesRes.data || []).map((row) => row.reel_id));
  const consumptionMap = new Map((consumptionRes.data || []).map((row) => [row.reel_id, row]));

  const reels = (reelsRes.data || []).map((reel) => {
    const stats = consumptionMap.get(reel.id);
    return {
      ...reel,
      is_favorite: favoriteSet.has(reel.id),
      view_count: stats?.view_count || 0,
      completion_count: stats?.completion_count || 0,
      total_watch_seconds: stats?.total_watch_seconds || 0,
      last_viewed_at: stats?.last_viewed_at || null,
    };
  });

  return reels;
};

export function useReelsCatalog(userId, { autoSync = true } = {}) {
  const query = useQuery({
    queryKey: ['reels-catalog', userId, autoSync],
    enabled: !!userId,
    queryFn: () => fetchReelsBundle(userId, { autoSync }),
    staleTime: 1000 * 45,
  });

  const reels = query.data || [];

  const reelOfDay = useMemo(() => {
    if (!reels.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    const todays = reels.filter((reel) => String(reel.updated_at || reel.created_at || '').startsWith(today));
    const pool = todays.length ? todays : reels;

    const sorted = [...pool].sort((a, b) => {
      const completionScoreA = a.completion_count > 0 ? 1 : 0;
      const completionScoreB = b.completion_count > 0 ? 1 : 0;
      if (completionScoreA !== completionScoreB) return completionScoreA - completionScoreB;
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });

    return sorted[0] || null;
  }, [reels]);

  return {
    ...query,
    reels,
    reelOfDay,
    filterOptions: FILTER_OPTIONS,
  };
}

export function useToggleReelFavorite(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reelId, isFavorite }) => {
      if (!userId) throw new Error('Usuário não autenticado.');
      if (isFavorite) {
        const { error } = await supabase
          .from('reel_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('reel_id', reelId);
        if (error) throw error;
        return false;
      }

      const { error } = await supabase
        .from('reel_favorites')
        .insert({ user_id: userId, reel_id: reelId });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-catalog', userId] });
    },
  });
}

export function useTrackReelConsumption(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reelId, watchedSeconds = 0, completed = false }) => {
      if (!userId) throw new Error('Usuário não autenticado.');
      const { data: existing, error: existingError } = await supabase
        .from('reel_consumption')
        .select('id, view_count, completion_count, total_watch_seconds')
        .eq('user_id', userId)
        .eq('reel_id', reelId)
        .maybeSingle();

      if (existingError) throw existingError;

      const nowIso = new Date().toISOString();
      if (existing) {
        const { error } = await supabase
          .from('reel_consumption')
          .update({
            view_count: (existing.view_count || 0) + 1,
            completion_count: (existing.completion_count || 0) + (completed ? 1 : 0),
            total_watch_seconds: (existing.total_watch_seconds || 0) + Math.max(0, watchedSeconds),
            last_viewed_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', existing.id);

        if (error) throw error;
        return true;
      }

      const { error } = await supabase
        .from('reel_consumption')
        .insert({
          user_id: userId,
          reel_id: reelId,
          view_count: 1,
          completion_count: completed ? 1 : 0,
          total_watch_seconds: Math.max(0, watchedSeconds),
          last_viewed_at: nowIso,
        });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels-catalog', userId] });
    },
  });
}

const sourceTypeMeta = {
  tarot_weekly: { kind: 'Tarot semanal', ctaLabel: 'Abrir Tarot', ctaTo: '/tarot' },
  unified_reading: { kind: 'Síntese semanal', ctaLabel: 'Abrir Síntese', ctaTo: '/oraculo/geral' },
  runes_weekly: { kind: 'Runas', ctaLabel: 'Abrir Runas', ctaTo: '/runas' },
  iching_weekly: { kind: 'I Ching', ctaLabel: 'Abrir I Ching', ctaTo: '/iching' },
  numerology_weekly: { kind: 'Numerologia', ctaLabel: 'Abrir Numerologia', ctaTo: '/numerologia' },
};

const mapReelToUi = (reel) => {
  const meta = sourceTypeMeta[reel.source_type] || {};
  return {
    id: reel.id,
    sourceType: reel.source_type,
    kind: meta.kind || reel.source_type || 'Oráculo',
    title: reel.title,
    hook: reel.hook,
    description: reel.description,
    duration: `00:${String(Math.max(0, reel.duration_seconds || 0)).padStart(2, '0')}`,
    durationSeconds: reel.duration_seconds || 0,
    ctaLabel: meta.ctaLabel || 'Abrir',
    ctaTo: reel.cta_path || meta.ctaTo || '/reels',
    createdAt: reel.updated_at || reel.created_at,
    isFavorite: Boolean(reel.is_favorite),
    viewCount: reel.view_count || 0,
    completionCount: reel.completion_count || 0,
  };
};

export function useReelsLab(userId) {
  const [selectedType, setSelectedType] = useState('all');
  const reelsCatalog = useReelsCatalog(userId, { autoSync: true });
  const favoriteMutation = useToggleReelFavorite(userId);
  const trackMutation = useTrackReelConsumption(userId);

  const reels = useMemo(
    () => (reelsCatalog.reels || []).map(mapReelToUi),
    [reelsCatalog.reels],
  );

  const favoritesSet = useMemo(
    () => new Set(reels.filter((reel) => reel.isFavorite).map((reel) => reel.id)),
    [reels],
  );

  const toggleFavorite = (reelId) => {
    const reel = reels.find((item) => item.id === reelId);
    if (!reel) return;
    favoriteMutation.mutate({ reelId, isFavorite: reel.isFavorite });
  };

  const registerView = (reelId, watchedSeconds = 12) => {
    trackMutation.mutate({ reelId, watchedSeconds, completed: false });
  };

  const registerCompletion = (reelId, watchedSeconds = 30) => {
    trackMutation.mutate({ reelId, watchedSeconds, completed: true });
  };

  return {
    reels,
    reelOfDay: reelsCatalog.reelOfDay ? mapReelToUi(reelsCatalog.reelOfDay) : null,
    isLoading: reelsCatalog.isLoading,
    selectedType,
    setSelectedType,
    favoritesSet,
    toggleFavorite,
    registerView,
    registerCompletion,
  };
}
