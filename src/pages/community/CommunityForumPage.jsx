import React, { useEffect, useMemo, useState } from 'react';
import { baralhoDetalhado } from '../../tarotDeck';
import styles from './CommunityForumPage.module.css';

const FORUM_STORAGE_KEY = 'oracle-imageboard-forum:v1';
const FORUM_ALIAS_KEY = 'oracle-imageboard-alias:v1';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const categoryOptions = [
  { value: 'geral', label: 'Geral' },
  { value: 'cartas', label: 'Leituras de Cartas' },
  { value: 'interpretacao', label: 'Interpretação' },
  { value: 'estudo', label: 'Estudo' },
];

const normalizeCardToken = (value) =>
  (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const generateAlias = () => `Anon-${Math.floor(1000 + Math.random() * 9000)}`;

const getAlias = () => {
  if (typeof window === 'undefined') return generateAlias();
  const existing = window.localStorage.getItem(FORUM_ALIAS_KEY);
  if (existing) return existing;
  const alias = generateAlias();
  window.localStorage.setItem(FORUM_ALIAS_KEY, alias);
  return alias;
};

const formatDate = (isoDate) => {
  if (!isoDate) return 'agora';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
};

const buildCardLookup = () => {
  const lookup = new Map();
  baralhoDetalhado.forEach((card) => {
    const bySlug = normalizeCardToken(card.slug);
    const byName = normalizeCardToken(card.nome);
    const compactName = byName.replace(/-/g, '');
    lookup.set(bySlug, card);
    lookup.set(byName, card);
    lookup.set(compactName, card);
  });
  return lookup;
};

const parseMentionCards = (text, cardLookup) => {
  const matches = text.match(/@[A-Za-zÀ-ÿ0-9_-]+/g) || [];
  const unique = new Map();

  matches.forEach((mention) => {
    const token = normalizeCardToken(mention.slice(1));
    const byToken = cardLookup.get(token) || cardLookup.get(token.replace(/-/g, ''));
    if (byToken) unique.set(byToken.slug, byToken);
  });

  return Array.from(unique.values());
};

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadTopics = () => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FORUM_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function CommunityForumPage() {
  const cardLookup = useMemo(() => buildCardLookup(), []);
  const [topics, setTopics] = useState(() => loadTopics());
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [formError, setFormError] = useState('');

  const [newTopic, setNewTopic] = useState({
    title: '',
    body: '',
    category: 'geral',
    imageDataUrl: '',
  });
  const [replyDraft, setReplyDraft] = useState({
    body: '',
    imageDataUrl: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(topics));
    }
  }, [topics]);

  useEffect(() => {
    if (!selectedTopicId && topics[0]?.id) {
      setSelectedTopicId(topics[0].id);
    }
    if (selectedTopicId && !topics.some((topic) => topic.id === selectedTopicId)) {
      setSelectedTopicId(topics[0]?.id || null);
    }
  }, [topics, selectedTopicId]);

  const filteredTopics = useMemo(() => {
    const source = [...topics].sort(
      (a, b) => new Date(b.bumped_at || b.created_at).getTime() - new Date(a.bumped_at || a.created_at).getTime(),
    );
    if (activeCategory === 'all') return source;
    return source.filter((topic) => topic.category === activeCategory);
  }, [topics, activeCategory]);

  const selectedTopic = filteredTopics.find((topic) => topic.id === selectedTopicId) || null;

  const renderTextWithMentions = (text) => {
    const parts = text.split(/(@[A-Za-zÀ-ÿ0-9_-]+)/g);
    return parts.map((part, index) => {
      if (!part.startsWith('@')) {
        return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      }
      const mentionToken = normalizeCardToken(part.slice(1));
      const card = cardLookup.get(mentionToken) || cardLookup.get(mentionToken.replace(/-/g, ''));
      if (!card) return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      return (
        <span key={`${part}-${index}`} className={styles.mentionBubble} title={card.nome}>
          <img src={card.img} alt={card.nome} />
          <strong>{card.nome}</strong>
        </span>
      );
    });
  };

  const handleImageSelection = async (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError('A imagem precisa ter no máximo 2MB.');
      return;
    }
    try {
      const dataUrl = await toDataUrl(file);
      setter(dataUrl);
      setFormError('');
    } catch {
      setFormError('Não foi possível processar a imagem.');
    }
  };

  const handleCreateTopic = (event) => {
    event.preventDefault();
    const title = newTopic.title.trim();
    const body = newTopic.body.trim();

    if (title.length < 6) {
      setFormError('O título precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (body.length < 12) {
      setFormError('A mensagem inicial precisa ter pelo menos 12 caracteres.');
      return;
    }

    const now = new Date().toISOString();
    const mentionCards = parseMentionCards(`${title} ${body}`, cardLookup);
    const topicPayload = {
      id: (globalThis.crypto?.randomUUID?.() || `${Date.now()}`),
      title,
      body,
      category: newTopic.category,
      imageDataUrl: newTopic.imageDataUrl || null,
      mentions: mentionCards.map((card) => card.slug),
      created_at: now,
      bumped_at: now,
      author_alias: getAlias(),
      replies: [],
    };

    setTopics((prev) => [topicPayload, ...prev]);
    setSelectedTopicId(topicPayload.id);
    setNewTopic({
      title: '',
      body: '',
      category: 'geral',
      imageDataUrl: '',
    });
    setFormError('');
  };

  const handleReply = (event) => {
    event.preventDefault();
    if (!selectedTopic) return;
    const body = replyDraft.body.trim();
    if (body.length < 3) {
      setFormError('A resposta precisa ter pelo menos 3 caracteres.');
      return;
    }

    const now = new Date().toISOString();
    const mentionCards = parseMentionCards(body, cardLookup);
    const reply = {
      id: (globalThis.crypto?.randomUUID?.() || `${Date.now()}-reply`),
      body,
      imageDataUrl: replyDraft.imageDataUrl || null,
      mentions: mentionCards.map((card) => card.slug),
      created_at: now,
      author_alias: getAlias(),
    };

    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== selectedTopic.id) return topic;
        return {
          ...topic,
          bumped_at: now,
          replies: [...(Array.isArray(topic.replies) ? topic.replies : []), reply],
        };
      }),
    );
    setReplyDraft({ body: '', imageDataUrl: '' });
    setFormError('');
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Fórum • Image-board</p>
        <h1>Fórum de Cartas</h1>
        <p>
          Tópicos são criados direto aqui. Use @nome-da-carta para invocar uma carta com preview
          dentro da conversa e anexe imagens para enriquecer o debate.
        </p>
      </header>

      <section className={styles.layout}>
        <aside className={styles.createPanel}>
          <h2>Criar tópico</h2>
          <form onSubmit={handleCreateTopic} className={styles.form}>
            <label htmlFor="topic-title">Título</label>
            <input
              id="topic-title"
              value={newTopic.title}
              onChange={(e) => setNewTopic((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: @sete-de-copas na posição futuro"
              maxLength={120}
            />

            <label htmlFor="topic-category">Categoria</label>
            <select
              id="topic-category"
              value={newTopic.category}
              onChange={(e) => setNewTopic((prev) => ({ ...prev, category: e.target.value }))}
            >
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <label htmlFor="topic-body">Mensagem inicial</label>
            <textarea
              id="topic-body"
              value={newTopic.body}
              onChange={(e) => setNewTopic((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="Ex: Estou estudando @a-sacerdotisa e @o-louco, qual leitura vocês fariam?"
              rows={5}
            />

            <label htmlFor="topic-image">Imagem (opcional, até 2MB)</label>
            <input
              id="topic-image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) =>
                handleImageSelection(e, (imageDataUrl) =>
                  setNewTopic((prev) => ({ ...prev, imageDataUrl })),
                )
              }
            />
            {newTopic.imageDataUrl && (
              <img className={styles.previewImage} src={newTopic.imageDataUrl} alt="Prévia do tópico" />
            )}

            <button type="submit">Publicar tópico</button>
            {formError && <p className={styles.error}>{formError}</p>}
          </form>
          <p className={styles.hint}>
            Dica: mencione cartas com @slug ou @nome sem espaços, como @a-sacerdotisa ou @sete-de-copas.
          </p>
        </aside>

        <main className={styles.boardPanel}>
          <div className={styles.filterRow}>
            <button
              type="button"
              className={activeCategory === 'all' ? styles.active : ''}
              onClick={() => setActiveCategory('all')}
            >
              Todos
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category.value}
                type="button"
                className={activeCategory === category.value ? styles.active : ''}
                onClick={() => setActiveCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className={styles.contentGrid}>
            <section className={styles.topicList}>
              {filteredTopics.length === 0 && (
                <p className={styles.empty}>Sem tópicos ainda nesta categoria.</p>
              )}
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={`${styles.topicButton} ${selectedTopicId === topic.id ? styles.topicButtonActive : ''}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <span className={styles.topicCategory}>
                    {categoryOptions.find((item) => item.value === topic.category)?.label || 'Geral'}
                  </span>
                  <h3>{topic.title}</h3>
                  <p>
                    {topic.replies?.length || 0} respostas • atualizado em {formatDate(topic.bumped_at)}
                  </p>
                </button>
              ))}
            </section>

            <section className={styles.threadPanel}>
              {!selectedTopic && <p className={styles.empty}>Selecione um tópico para ver a conversa.</p>}
              {selectedTopic && (
                <>
                  <article className={styles.threadCard}>
                    <header>
                      <span className={styles.topicCategory}>
                        {categoryOptions.find((item) => item.value === selectedTopic.category)?.label || 'Geral'}
                      </span>
                      <span>{selectedTopic.author_alias} • {formatDate(selectedTopic.created_at)}</span>
                    </header>
                    <h2>{selectedTopic.title}</h2>
                    <p className={styles.threadBody}>{renderTextWithMentions(selectedTopic.body)}</p>
                    {selectedTopic.imageDataUrl && (
                      <img className={styles.threadImage} src={selectedTopic.imageDataUrl} alt="Imagem do tópico" />
                    )}
                  </article>

                  <div className={styles.replyList}>
                    {(selectedTopic.replies || []).length === 0 && (
                      <p className={styles.empty}>Ainda não há respostas neste tópico.</p>
                    )}
                    {(selectedTopic.replies || []).map((reply) => (
                      <article key={reply.id} className={styles.replyCard}>
                        <header>{reply.author_alias} • {formatDate(reply.created_at)}</header>
                        <p>{renderTextWithMentions(reply.body)}</p>
                        {reply.imageDataUrl && (
                          <img className={styles.threadImage} src={reply.imageDataUrl} alt="Imagem da resposta" />
                        )}
                      </article>
                    ))}
                  </div>

                  <form className={styles.replyForm} onSubmit={handleReply}>
                    <label htmlFor="reply-body">Responder tópico</label>
                    <textarea
                      id="reply-body"
                      value={replyDraft.body}
                      onChange={(e) => setReplyDraft((prev) => ({ ...prev, body: e.target.value }))}
                      placeholder="Responda e mencione cartas com @..."
                      rows={4}
                    />
                    <label htmlFor="reply-image">Imagem da resposta (opcional)</label>
                    <input
                      id="reply-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) =>
                        handleImageSelection(e, (imageDataUrl) =>
                          setReplyDraft((prev) => ({ ...prev, imageDataUrl })),
                        )
                      }
                    />
                    {replyDraft.imageDataUrl && (
                      <img className={styles.previewImage} src={replyDraft.imageDataUrl} alt="Prévia da resposta" />
                    )}
                    <button type="submit">Responder</button>
                  </form>
                </>
              )}
            </section>
          </div>
        </main>
      </section>
    </div>
  );
}
