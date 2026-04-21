import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../supabaseClient';
import styles from './EditarPerfilPage.module.css';
import { baralhoDetalhado } from '../../tarotDeck';
import Loader from '../../components/common/Loader/Loader';
import ChangePasswordForm from '../../pages/auth/ChangePasswordForm/ChangePasswordForm';
import { getMissingProfileFields } from '../../utils/profileCompletion';

function EditarPerfilPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { profile, updateProfile, isLoading: isProfileLoading, isUpdating, error: profileError } = useUserProfile(user?.id);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [minhaHistoria, setMinhaHistoria] = useState('');
  const [entidadeCultuada, setEntidadeCultuada] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasAutoSelectedAvatar = useRef(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
      setBio(profile.bio || '');
      setMinhaHistoria(profile.minha_historia || '');
      setEntidadeCultuada(profile.entidade_cultuada || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.avatar_url || hasAutoSelectedAvatar.current) return;
    const randomIndex = Math.floor(Math.random() * baralhoDetalhado.length);
    const randomCard = baralhoDetalhado[randomIndex];
    hasAutoSelectedAvatar.current = true;
    setAvatarUrl(randomCard.img);
    updateProfile({ avatar_url: randomCard.img });
  }, [profile, updateProfile]);

  const missingFields = useMemo(() => {
    const labels = { username: 'Nome de usuário', full_name: 'Nome completo', avatar_url: 'Arcano de perfil' };
    return getMissingProfileFields({ username, full_name: fullName, avatar_url: avatarUrl }, labels);
  }, [username, fullName, avatarUrl]);

  const profileChecklist = useMemo(() => ([
    { key: 'username',          label: 'Nome de usuário',      filled: !!username.trim(),         required: true  },
    { key: 'full_name',         label: 'Nome completo',         filled: !!fullName.trim(),          required: true  },
    { key: 'avatar_url',        label: 'Carta de perfil',       filled: !!avatarUrl,                required: true  },
    { key: 'bio',               label: 'Bio',                   filled: !!bio.trim(),               required: false },
    { key: 'minha_historia',    label: 'Minha história',        filled: !!minhaHistoria.trim(),     required: false },
    { key: 'entidade_cultuada', label: 'Entidades / arquétipos',filled: !!entidadeCultuada.trim(),  required: false },
  ]), [username, fullName, avatarUrl, bio, minhaHistoria, entidadeCultuada]);

  const completionPercent = useMemo(() => {
    const filled = profileChecklist.filter(i => i.filled).length;
    return Math.round((filled / profileChecklist.length) * 100);
  }, [profileChecklist]);

  const isFirstLogin = !(profile?.username && profile?.full_name && profile?.avatar_url);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });
    if (missingFields.length) {
      setMessage({ text: `Preencha os campos obrigatórios: ${missingFields.join(', ')}.`, isError: true });
      return;
    }
    updateProfile(
      { username, full_name: fullName, avatar_url: avatarUrl, bio, minha_historia: minhaHistoria, entidade_cultuada: entidadeCultuada },
      {
        onSuccess: () => {
          setMessage({ text: 'Perfil salvo com sucesso! Redirecionando...', isError: false });
          setTimeout(() => navigate('/perfil'), 1800);
        },
        onError: (err) => setMessage({ text: `Erro ao salvar: ${err.message}`, isError: true }),
      }
    );
  };

  const handleRandomCardSelect = () => {
    const randomCard = baralhoDetalhado[Math.floor(Math.random() * baralhoDetalhado.length)];
    setAvatarUrl(randomCard.img);
    setShowModal(false);
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Esta ação é irreversível. Para confirmar, digite "DELETAR":');
    if (confirmation !== 'DELETAR') return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      await signOut();
      navigate('/');
    } catch (err) {
      setMessage({ text: `Erro ao deletar conta: ${err.message}`, isError: true });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isProfileLoading) return <Loader customText="Carregando seu perfil..." />;
  if (profileError) return <div className="content_wrapper"><p>Erro ao carregar perfil: {profileError.message}</p></div>;

  return (
    <div className="content_wrapper">
      <div className={styles.page}>

        {/* ── Topo: avatar + identidade ── */}
        <div className={styles.profileHero}>
          <div className={styles.avatarWrap}>
            <img
              src={avatarUrl || 'https://i.imgur.com/6VBx3io.png'}
              alt="Arcano de perfil"
              className={styles.avatarImg}
            />
            <button type="button" className={styles.avatarEditBtn} onClick={() => setShowModal(true)} disabled={isUpdating || isDeleting}>
              Trocar carta
            </button>
          </div>
          <div className={styles.heroInfo}>
            {isFirstLogin
              ? <><p className={styles.heroEyebrow}>Primeiro acesso</p><h1 className={styles.heroTitle}>Configure seu perfil</h1><p className={styles.heroSub}>Preencha seu nome e escolha uma carta para começar a usar a plataforma.</p></>
              : <><p className={styles.heroEyebrow}>Configurações</p><h1 className={styles.heroTitle}>{fullName || username || 'Seu perfil'}</h1><p className={styles.heroSub}>{user?.email}</p></>
            }
          </div>
        </div>

        {/* ── Formulário principal ── */}
        <form onSubmit={handleUpdateProfile} className={styles.card}>
          <h2 className={styles.cardTitle}>Dados do perfil</h2>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">Nome de usuário <span className={styles.req}>*</span></label>
              <input className={styles.input} id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="seu_usuario" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fullName">Nome completo <span className={styles.req}>*</span></label>
              <input className={styles.input} id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu Nome" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="bio">Bio <span className={styles.opt}>opcional</span></label>
            <textarea className={styles.textarea} id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Uma frase curta que te define..." rows={2} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="minhaHistoria">Minha história <span className={styles.opt}>opcional</span></label>
            <textarea className={styles.textarea} id="minhaHistoria" value={minhaHistoria} onChange={e => setMinhaHistoria(e.target.value)} placeholder="Conte um pouco da sua jornada esotérica..." rows={4} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="entidadeCultuada">Entidades / arquétipos que admiro <span className={styles.opt}>opcional</span></label>
            <input className={styles.input} id="entidadeCultuada" type="text" value={entidadeCultuada} onChange={e => setEntidadeCultuada(e.target.value)} placeholder="Ex: Hécate, Odin, Orixás..." />
          </div>

          <div className={styles.formFooter}>
            {message.text && (
              <p className={`${styles.feedback} ${message.isError ? styles.feedbackError : styles.feedbackSuccess}`}>
                {message.text}
              </p>
            )}
            <div className={styles.formActions}>
              <Link to="/perfil" className={styles.cancelBtn}>Cancelar</Link>
              <button type="submit" className={styles.saveBtn} disabled={isUpdating || isDeleting}>
                {isUpdating ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </form>

        {/* ── Completude do perfil ── */}
        <div className={styles.card}>
          <div className={styles.completionHeader}>
            <h2 className={styles.cardTitle}>Completude do perfil</h2>
            <span className={styles.completionPct}>{completionPercent}%</span>
          </div>
          <div className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ width: `${completionPercent}%` }} />
          </div>
          <ul className={styles.checklist}>
            {profileChecklist.map(item => (
              <li key={item.key} className={`${styles.checkItem} ${item.filled ? styles.checkItemDone : ''}`}>
                <span className={styles.checkIcon}>{item.filled ? '✓' : '○'}</span>
                <span>{item.label}</span>
                {!item.filled && item.required && <span className={styles.checkReq}>obrigatório</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Segurança ── */}
        <details className={styles.accordion}>
          <summary className={styles.accordionSummary}>
            <span>Segurança da Conta</span>
            <span className={styles.accordionHint}>Alterar senha</span>
          </summary>
          <div className={styles.accordionBody}>
            <ChangePasswordForm />
          </div>
        </details>

        {/* ── Área de perigo ── */}
        <details className={`${styles.accordion} ${styles.accordionDanger}`}>
          <summary className={styles.accordionSummary}>
            <span>Área de Perigo</span>
            <span className={styles.accordionHint}>Excluir conta</span>
          </summary>
          <div className={styles.accordionBody}>
            <p className={styles.dangerText}>A exclusão é permanente e removerá todas as suas leituras e dados. Esta ação não pode ser desfeita.</p>
            <button onClick={handleDeleteAccount} className={styles.deleteBtn} disabled={isUpdating || isDeleting}>
              {isDeleting ? 'Processando...' : 'Deletar minha conta permanentemente'}
            </button>
          </div>
        </details>

      </div>

      {/* ── Modal de escolha de carta ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTop}>
              <h3 className={styles.modalTitle}>Escolha seu Arcano</h3>
              <button type="button" onClick={handleRandomCardSelect} className={styles.randomBtn}>✨ Sortear para mim</button>
            </div>
            <div className={styles.cardGrid}>
              {baralhoDetalhado.map(carta => (
                <img
                  key={carta.id}
                  src={carta.img}
                  alt={carta.nome}
                  className={`${styles.cardOption} ${avatarUrl === carta.img ? styles.cardOptionActive : ''}`}
                  onClick={() => { setAvatarUrl(carta.img); setShowModal(false); }}
                />
              ))}
            </div>
            <button onClick={() => setShowModal(false)} className={styles.modalCloseBtn}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditarPerfilPage;
