import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import Loader from '../../components/common/Loader/Loader';
import styles from './ProfilePage.module.css';

const spreadTypeLabels = {
  oneCard: 'Tarot (1 carta)',
  threeCards: 'Tarot (3 cartas)',
  celticCross: 'Tarot (Cruz Celta)',
  templeOfAphrodite: 'Tarot (Templo de Afrodite)',
  pathChoice: 'Tarot (Escolha de Caminho)',
};

const formatDate = (value) => {
  if (!value) return 'Data indisponível';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const renderFormattedText = (text, customClassName = '') => {
  if (!text) return null;
  const regex = /\*\*(.*?)\*\*/g;

  return (
    <div className={`${styles.meaningText} ${customClassName}`}>
      {text.split('\n').map((paragraph, pIndex) => {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph) return null;

        const parts = trimmedParagraph.split(regex);
        return (
          <p key={pIndex}>
            {parts.map((part, partIndex) => (
              partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
            ))}
          </p>
        );
      })}
    </div>
  );
};

const parseLifePathMeaning = (lifePathMeaning) => {
  if (!lifePathMeaning) return null;
  const parts = {
    essence: lifePathMeaning.split('* **')[0]?.trim() || '',
    light: lifePathMeaning.match(/\* \*\*Luz:\*\*(.*?)(?=\* \*\*|$)/s)?.[1]?.trim() || '',
    shadow: lifePathMeaning.match(/\* \*\*Sombra:\*\*(.*?)(?=\* \*\*|$)/s)?.[1]?.trim() || '',
    mission: lifePathMeaning.match(/\* \*\*Missão:\*\*(.*?)(?=\* \*\*|$)/s)?.[1]?.trim() || '',
  };
  if (parts.light.startsWith('Luz:**')) parts.light = parts.light.substring(6).trim();
  if (parts.shadow.startsWith('Sombra:**')) parts.shadow = parts.shadow.substring(9).trim();
  if (parts.mission.startsWith('Missão:**')) parts.mission = parts.mission.substring(9).trim();

  return parts.essence ? parts : null;
};

const parseArchetype = (birthdaySecretMeaning) => {
  if (!birthdaySecretMeaning) return null;
  try {
    const data = JSON.parse(birthdaySecretMeaning);
    if (data.error) return null;
    return data;
  } catch (error) {
    console.warn('Falha ao interpretar o arquétipo da IA:', error);
    return {
      archetype_title: 'O Arquétipo do Dia',
      archetype_description: birthdaySecretMeaning,
      numerology_details: null,
      tarot_card: null,
      advice: null,
      strengths: [],
      weaknesses: [],
    };
  }
};

const getPayloadHeadline = (payload) => (
  payload?.headline
  || payload?.summary
  || payload?.one_liner
  || payload?.weekly_focus
  || ''
);

const getPayloadWeekLabel = (weekRef) => (weekRef ? `Semana ${weekRef}` : 'Semana atual');

function usePublicProfile(username) {
  return useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      if (!username) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, username, full_name, avatar_url, bio,
          minha_historia, entidade_cultuada,
          life_path_number, birthday_number
        `)
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') throw new Error('Perfil não encontrado.');
      else if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });
}

function usePublicReadingCount(userId) {
  return useQuery({
    queryKey: ['publicReadingCount', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { count, error } = await supabase
        .from('readings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) throw error;
      return count;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 15,
  });
}

function usePublicNumerology(userId) {
  return useQuery({
    queryKey: ['publicNumerology', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .rpc('get_public_numerology_by_user_id', { profile_id: userId })
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  });
}

function useProfileOracleData(userId) {
  return useQuery({
    queryKey: ['profileOracleData', userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!userId) {
        return {
          summary: null,
          timeline: [],
        };
      }

      const safeQuery = async (label, query, fallback) => {
        const { data, error } = await query;
        if (error) {
          console.warn(`Falha ao buscar ${label} no perfil dinâmico:`, error.message);
          return fallback;
        }
        return data ?? fallback;
      };

      const [
        readings,
        weeklyCards,
        modules,
        unifiedReadings,
        numerologyWeekly,
      ] = await Promise.all([
        safeQuery(
          'leituras',
          supabase
            .from('readings')
            .select('id, created_at, spread_type, is_public')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
          [],
        ),
        safeQuery(
          'tarot semanal',
          supabase
            .from('weekly_cards')
            .select('id, card_name, week_start, created_at')
            .eq('user_id', userId)
            .order('week_start', { ascending: false })
            .limit(4),
          [],
        ),
        safeQuery(
          'módulos semanais',
          supabase
            .from('oracle_weekly_modules')
            .select('id, oracle_type, output_payload, week_start, updated_at, status')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(24),
          [],
        ),
        safeQuery(
          'síntese semanal',
          supabase
            .from('unified_readings')
            .select('id, week_ref, created_at, final_reading')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(6),
          [],
        ),
        safeQuery(
          'numerologia semanal',
          supabase
            .from('numerology_weekly_readings')
            .select('id, week_start, created_at, result_payload')
            .eq('user_id', userId)
            .order('week_start', { ascending: false })
            .limit(4),
          [],
        ),
      ]);

      const latestWeeklyCard = weeklyCards?.[0] || null;
      const runesModule = modules.find((item) => String(item.oracle_type || '').includes('runes') && item.status === 'ok') || null;
      const ichingModule = modules.find((item) => String(item.oracle_type || '').includes('iching') && item.status === 'ok') || null;
      const latestUnifiedReading = unifiedReadings?.[0] || null;
      const latestNumerologyWeekly = numerologyWeekly?.[0] || null;

      const summary = {
        tarot: latestWeeklyCard
          ? {
              title: latestWeeklyCard.card_name || 'Carta semanal registrada',
              description: latestWeeklyCard.card_name ? `Carta da semana: ${latestWeeklyCard.card_name}.` : 'Leitura semanal registrada.',
              meta: getPayloadWeekLabel(latestWeeklyCard.week_start),
              updatedAt: latestWeeklyCard.created_at || latestWeeklyCard.week_start,
            }
          : null,
        runes: runesModule
          ? {
              title: 'Runas semanais',
              description: getPayloadHeadline(runesModule.output_payload) || 'Módulo de runas atualizado.',
              meta: getPayloadWeekLabel(runesModule.week_start),
              updatedAt: runesModule.updated_at || runesModule.week_start,
            }
          : null,
        iching: ichingModule
          ? {
              title: 'I Ching semanal',
              description: getPayloadHeadline(ichingModule.output_payload) || 'Módulo de I Ching atualizado.',
              meta: getPayloadWeekLabel(ichingModule.week_start),
              updatedAt: ichingModule.updated_at || ichingModule.week_start,
            }
          : null,
        synthesis: latestUnifiedReading
          ? {
              title: latestUnifiedReading.final_reading?.title || 'Síntese Semanal',
              description: latestUnifiedReading.final_reading?.one_liner || 'Síntese integrada disponível.',
              meta: getPayloadWeekLabel(latestUnifiedReading.week_ref),
              updatedAt: latestUnifiedReading.created_at,
            }
          : null,
        numerologyWeekly: latestNumerologyWeekly
          ? {
              title: 'Numerologia semanal',
              description: getPayloadHeadline(latestNumerologyWeekly.result_payload) || 'Energia numerológica da semana disponível.',
              meta: getPayloadWeekLabel(latestNumerologyWeekly.week_start),
              updatedAt: latestNumerologyWeekly.created_at || latestNumerologyWeekly.week_start,
            }
          : null,
      };

      const readingEvents = (readings || []).map((reading) => ({
        id: `reading-${reading.id}`,
        at: reading.created_at,
        title: spreadTypeLabels[reading.spread_type] || 'Leitura de Tarot registrada',
        description: reading.is_public ? 'Leitura marcada como compartilhável.' : 'Leitura salva no grimório pessoal.',
      }));

      const weeklyCardEvents = (weeklyCards || []).map((record) => ({
        id: `weekly-card-${record.id}`,
        at: record.created_at || record.week_start,
        title: 'Carta semanal revelada',
        description: record.card_name ? `Carta da semana: ${record.card_name}.` : 'Carta semanal atualizada.',
      }));

      const moduleEvents = (modules || []).slice(0, 8).map((module) => {
        const moduleType = String(module.oracle_type || '').toLowerCase();
        const label = moduleType.includes('runes')
          ? 'Módulo semanal de Runas'
          : moduleType.includes('iching')
            ? 'Módulo semanal de I Ching'
            : 'Módulo semanal atualizado';
        return {
          id: `module-${module.id}`,
          at: module.updated_at || module.week_start,
          title: label,
          description: getPayloadHeadline(module.output_payload) || 'Novo sinal adicionado ao oráculo semanal.',
        };
      });

      const unifiedEvents = (unifiedReadings || []).map((reading) => ({
        id: `unified-${reading.id}`,
        at: reading.created_at,
        title: reading.final_reading?.title || 'Síntese Semanal gerada',
        description: reading.final_reading?.one_liner || 'Síntese integrada registrada no grimório.',
      }));

      const numerologyEvents = (numerologyWeekly || []).map((record) => ({
        id: `numerology-${record.id}`,
        at: record.created_at || record.week_start,
        title: 'Numerologia semanal calculada',
        description: getPayloadHeadline(record.result_payload) || 'Energia da semana consolidada.',
      }));

      const timeline = [
        ...readingEvents,
        ...weeklyCardEvents,
        ...moduleEvents,
        ...unifiedEvents,
        ...numerologyEvents,
      ]
        .filter((event) => event.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 12);

      return {
        summary,
        timeline,
      };
    },
  });
}

function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile, isLoading: isLoadingProfile, isError, error } = usePublicProfile(username);
  const profileId = profile?.id;

  const { data: readingCount, isLoading: isLoadingCount } = usePublicReadingCount(profileId);
  const { data: numerology, isLoading: isLoadingNumerology } = usePublicNumerology(profileId);
  const { data: oracleData, isLoading: isLoadingOracleData } = useProfileOracleData(profileId);

  const oracleSummary = oracleData?.summary || {};
  const timeline = oracleData?.timeline || [];

  const handleBackClick = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };

  const renderArchetypeCard = (archetypeData) => {
    if (!archetypeData.numerology_details) {
      return (
        <div className={styles.cardSubSection}>
          {renderFormattedText(archetypeData.archetype_description)}
        </div>
      );
    }
    return (
      <div className={styles.archetypeGridContainer}>
        <div className={styles.archetypeMain}>
          <div className={styles.archetypeSection}>
            {renderFormattedText(archetypeData.archetype_description)}
          </div>
          {archetypeData.numerology_details && (
            <div className={styles.archetypeSection}>
              <h4>Numerologia e Planetas</h4>
              {renderFormattedText(archetypeData.numerology_details)}
            </div>
          )}
          {archetypeData.tarot_card && (
            <div className={styles.archetypeSection}>
              <h4>Tarot</h4>
              {renderFormattedText(archetypeData.tarot_card)}
            </div>
          )}
        </div>
        <div className={styles.archetypeSidebar}>
          {archetypeData.advice && (
            <div className={`${styles.archetypeListCard} ${styles.adviceCard}`}>
              <h5>Conselho</h5>
              {renderFormattedText(archetypeData.advice)}
            </div>
          )}
          {archetypeData.strengths?.length > 0 && (
            <div className={`${styles.archetypeListCard} ${styles.strengthsCard}`}>
              <h5>Pontos Fortes</h5>
              <ul className={styles.archetypeList}>
                {archetypeData.strengths.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {archetypeData.weaknesses?.length > 0 && (
            <div className={`${styles.archetypeListCard} ${styles.weaknessesCard}`}>
              <h5>Pontos Fracos</h5>
              <ul className={styles.archetypeList}>
                {archetypeData.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasOracleSummary = useMemo(
    () => Boolean(
      oracleSummary.tarot
      || oracleSummary.runes
      || oracleSummary.iching
      || oracleSummary.synthesis
      || oracleSummary.numerologyWeekly,
    ),
    [oracleSummary],
  );

  const renderOracleCard = (label, data) => (
    <article className={styles.oracleMiniCard}>
      <p className={styles.oracleMiniLabel}>{label}</p>
      {data ? (
        <>
          <h4>{data.title}</h4>
          <p>{data.description}</p>
          <div className={styles.oracleMiniMeta}>
            <span>{data.meta}</span>
            <span>{formatDate(data.updatedAt)}</span>
          </div>
        </>
      ) : (
        <p className={styles.noDataMessage}>Ainda sem dados registrados.</p>
      )}
    </article>
  );

  const renderContent = () => {
    if (isLoadingProfile || isLoadingCount || isLoadingNumerology) {
      return <Loader customText={`Carregando perfil de @${username}...`} />;
    }

    if (isError) {
      return (
        <div className={styles.notFound}>
          <h1>Erro</h1>
          <p>{error.message === 'Perfil não encontrado.' ? `O perfil @${username} não existe.` : 'Ocorreu um erro ao carregar o perfil.'}</p>
        </div>
      );
    }

    if (profile) {
      const lifePathParts = parseLifePathMeaning(numerology?.life_path_meaning);
      const archetypeData = parseArchetype(numerology?.birthday_secret_meaning);

      return (
        <div className={styles.profileLayoutGrid}>
          <aside className={styles.profileLeftColumn}>
            <img
              src={profile.avatar_url || 'https://i.imgur.com/6VBx3io.png'}
              alt={`Avatar de ${profile.username}`}
              className={styles.profileAvatar}
            />
            <h1 className={styles.profileFullName}>{profile.full_name || profile.username}</h1>
            <p className={styles.profileUsername}>@{profile.username}</p>

            {profile.bio && (
              <p className={styles.profileBio}>"{profile.bio}"</p>
            )}

            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{profile.life_path_number || '-'}</span>
                <span className={styles.statLabel}>Caminho de Vida</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{readingCount ?? '-'}</span>
                <span className={styles.statLabel}>Leituras Feitas</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{profile.birthday_number || '-'}</span>
                <span className={styles.statLabel}>Dia Nascimento</span>
              </div>
            </div>
            <button onClick={handleBackClick} className={styles.backButton}>← Voltar</button>
          </aside>

          <main className={styles.profileRightColumn}>
            <section className={`${styles.profileSection} ${styles.oracleSection}`}>
              <h2>Painel Dinâmico dos Oráculos</h2>
              <p className={styles.introText}>
                Visão rápida dos sinais recentes de Tarot, Runas, I Ching, Numerologia e da Síntese Semanal.
              </p>
              {isLoadingOracleData ? (
                <p className={styles.noDataMessage}>Carregando sinais recentes...</p>
              ) : hasOracleSummary ? (
                <div className={styles.oracleGrid}>
                  {renderOracleCard('Tarot Semanal', oracleSummary.tarot)}
                  {renderOracleCard('Runas', oracleSummary.runes)}
                  {renderOracleCard('I Ching', oracleSummary.iching)}
                  {renderOracleCard('Síntese Semanal', oracleSummary.synthesis)}
                  {renderOracleCard('Numerologia Semanal', oracleSummary.numerologyWeekly)}
                </div>
              ) : (
                <p className={styles.noDataMessage}>Este perfil ainda não possui módulos suficientes para montar o painel dinâmico.</p>
              )}
            </section>

            <section className={`${styles.profileSection} ${styles.timelineSection}`}>
              <div className={styles.timelineHeader}>
                <h2>Linha do Tempo Pessoal</h2>
                <span>{timeline.length} eventos</span>
              </div>
              {isLoadingOracleData ? (
                <p className={styles.noDataMessage}>Montando linha do tempo...</p>
              ) : timeline.length > 0 ? (
                <ol className={styles.timelineList}>
                  {timeline.map((event) => (
                    <li key={event.id} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineBody}>
                        <p className={styles.timelineDate}>{formatDate(event.at)}</p>
                        <h4>{event.title}</h4>
                        {event.description && <p>{event.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.noDataMessage}>Sem eventos suficientes para a linha do tempo até o momento.</p>
              )}
            </section>

            {lifePathParts ? (
              <section className={`${styles.profileSection} ${styles.numerologyCard}`}>
                <h2>Caminho de Vida: {profile.life_path_number}</h2>
                <div className={styles.cardSubSection}>
                  <h4>Essência da Jornada:</h4>
                  {renderFormattedText(lifePathParts.essence)}
                </div>
                {lifePathParts.light && (
                  <div className={styles.cardSubSection}>
                    <h4 className={styles.lightTitle}>Luz:</h4>
                    {renderFormattedText(lifePathParts.light)}
                  </div>
                )}
                {lifePathParts.shadow && (
                  <div className={styles.cardSubSection}>
                    <h4 className={styles.shadowTitle}>Sombra:</h4>
                    {renderFormattedText(lifePathParts.shadow)}
                  </div>
                )}
                {lifePathParts.mission && (
                  <div className={styles.cardSubSection}>
                    <h4 className={styles.missionTitle}>Missão:</h4>
                    {renderFormattedText(lifePathParts.mission)}
                  </div>
                )}
              </section>
            ) : (
              profileId && !isLoadingNumerology && (
                <section className={styles.profileSection}>
                  <p className={styles.noDataMessage}>Dados de numerologia ainda não calculados por este usuário.</p>
                </section>
              )
            )}

            {archetypeData ? (
              <section className={`${styles.profileSection} ${styles.archetypeCard}`}>
                <h2>{archetypeData.archetype_title || 'Arquétipo do Aniversário'}</h2>
                {renderArchetypeCard(archetypeData)}
              </section>
            ) : (
              profileId && !isLoadingNumerology && (
                <section className={styles.profileSection}>
                  <p className={styles.noDataMessage}>Arquétipo do aniversário não disponível.</p>
                </section>
              )
            )}

            {profile.entidade_cultuada && (
              <section className={styles.profileSection}>
                <h2>Cultua / Admira</h2>
                <p>{profile.entidade_cultuada}</p>
              </section>
            )}

            {profile.minha_historia && (
              <section className={styles.profileSection}>
                <h2>Minha História</h2>
                <div className={styles.storyText}>
                  {profile.minha_historia.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph || '\u00A0'}</p>
                  ))}
                </div>
              </section>
            )}

            {!lifePathParts
              && !archetypeData
              && !profile.entidade_cultuada
              && !profile.minha_historia
              && !hasOracleSummary
              && timeline.length === 0 && (
                <p className={styles.noDataMessage}>Este perfil ainda não adicionou informações adicionais.</p>
              )}
          </main>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`content_wrapper ${styles.profileGridWrapper}`}>
      <div className={styles.profileContainer}>
        {renderContent()}
      </div>
    </div>
  );
}

export default ProfilePage;
