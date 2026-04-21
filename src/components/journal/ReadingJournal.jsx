import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import styles from './ReadingJournal.module.css';

const MOODS = [
  { value: 'expansivo', label: '✦ Expansivo' },
  { value: 'reflexivo', label: '◎ Reflexivo' },
  { value: 'gratidao', label: '♡ Gratidão' },
  { value: 'neutro', label: '— Neutro' },
  { value: 'tenso', label: '△ Tenso' },
];

export default function ReadingJournal({ sourceType, sourceId, weekRef }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const existingQuery = useQuery({
    queryKey: ['journal', user?.id, sourceType, sourceId],
    enabled: !!user?.id,
    queryFn: async () => {
      const query = supabase
        .from('reading_journals')
        .select('id, entry_text, mood, created_at')
        .eq('user_id', user.id)
        .eq('source_type', sourceType)
        .order('created_at', { ascending: false })
        .limit(1);
      if (sourceId) query.eq('source_id', sourceId);
      const { data } = await query.maybeSingle();
      return data || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('reading_journals')
        .insert({ user_id: user.id, source_type: sourceType, source_id: sourceId || null, week_ref: weekRef || null, entry_text: payload.entry, mood: payload.mood || null })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['journal', user?.id, sourceType, sourceId] });
    },
  });

  if (!user) return null;
  if (existingQuery.data && !submitted) return (
    <div className={styles.existing}>
      <p className={styles.existingLabel}>Seu registro desta leitura</p>
      <p className={styles.existingText}>{existingQuery.data.entry_text}</p>
      {existingQuery.data.mood && <span className={styles.moodBadge}>{MOODS.find(m => m.value === existingQuery.data.mood)?.label}</span>}
    </div>
  );

  if (submitted) return (
    <div className={styles.success}>
      <p>✦ Registro salvo no seu diário.</p>
    </div>
  );

  return (
    <div className={styles.journal}>
      <p className={styles.journalTitle}>Registrar reflexão</p>
      <p className={styles.journalHint}>O que essa leitura trouxe para você? Anote antes de esquecer.</p>
      <div className={styles.moods}>
        {MOODS.map(m => (
          <button
            key={m.value}
            type="button"
            className={`${styles.moodBtn} ${mood === m.value ? styles.moodBtnActive : ''}`}
            onClick={() => setMood(prev => prev === m.value ? '' : m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        className={styles.textarea}
        value={entry}
        onChange={e => setEntry(e.target.value)}
        placeholder="Escreva sua reflexão aqui..."
        rows={4}
        maxLength={1000}
      />
      <div className={styles.footer}>
        <span className={styles.charCount}>{entry.length}/1000</span>
        <button
          type="button"
          className={styles.saveButton}
          disabled={!entry.trim() || mutation.isPending}
          onClick={() => mutation.mutate({ entry: entry.trim(), mood })}
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar reflexão'}
        </button>
      </div>
      {mutation.isError && <p className={styles.error}>{mutation.error?.message}</p>}
    </div>
  );
}
