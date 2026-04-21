import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAutoHideHeader } from '../../hooks/useAutoHideHeader';
import { goBackOrFallback, resolveFallbackRoute } from '../../utils/navigation';
import styles from './Header.module.css';

function Header() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isWelcome = location.pathname === '/';
  const isInternal = Boolean(user);
  const isPublicHome = isWelcome && !user;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTarotOpen, setIsTarotOpen] = useState(false);
  const [isNumerologyOpen, setIsNumerologyOpen] = useState(false);
  const [isIChingOpen, setIsIChingOpen] = useState(false);

  const accountRef = useRef(null);
  const tarotRef = useRef(null);
  const numerologyRef = useRef(null);
  const ichingRef = useRef(null);
  const accountAnimationTimeout = useRef(null);
  const [isAccountAnimating, setIsAccountAnimating] = useState(false);
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);
  const leftDropdownRef = useRef(null);
  
  const { isHidden, reveal } = useAutoHideHeader(false);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
    setIsLeftDropdownOpen(false);
    setIsTarotOpen(false);
    setIsNumerologyOpen(false);
    setIsIChingOpen(false);
  }, [location.pathname]);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setIsAccountOpen(false);
      if (leftDropdownRef.current && !leftDropdownRef.current.contains(event.target)) setIsLeftDropdownOpen(false);
      if (tarotRef.current && !tarotRef.current.contains(event.target)) setIsTarotOpen(false);
      if (numerologyRef.current && !numerologyRef.current.contains(event.target)) setIsNumerologyOpen(false);
      if (ichingRef.current && !ichingRef.current.contains(event.target)) setIsIChingOpen(false);
    };

    if (isAccountOpen || isLeftDropdownOpen || isTarotOpen || isNumerologyOpen || isIChingOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountOpen, isLeftDropdownOpen, isTarotOpen, isNumerologyOpen, isIChingOpen]);

  // Revela o header se algum menu estiver aberto
  useEffect(() => {
    if (isMenuOpen || isAccountOpen || isLeftDropdownOpen || isTarotOpen || isNumerologyOpen || isIChingOpen) {
      reveal();
    }
  }, [isMenuOpen, isAccountOpen, isLeftDropdownOpen, isTarotOpen, isNumerologyOpen, isIChingOpen, reveal]);

  // Cleanup da animação
  useEffect(() => {
    return () => {
      if (accountAnimationTimeout.current) {
        clearTimeout(accountAnimationTimeout.current);
      }
    };
  }, []);

  const handleAccountToggle = () => {
    setIsAccountOpen((prev) => !prev);
    setIsAccountAnimating(true);
    if (accountAnimationTimeout.current) {
      clearTimeout(accountAnimationTimeout.current);
    }
    accountAnimationTimeout.current = setTimeout(() => {
      setIsAccountAnimating(false);
    }, 220);
  };

  const closeAllDropdowns = () => { setIsTarotOpen(false); setIsNumerologyOpen(false); setIsIChingOpen(false); };

  const canShowQuickBack = isInternal && !['/perfil', '/meu-grimorio'].includes(location.pathname);
  const handleQuickBack = () => {
    goBackOrFallback({
      navigate,
      location,
      fallbackPath: resolveFallbackRoute(location.pathname),
    });
  };

  return (
    <header
      className={`${styles.header} ${
        isInternal && isHidden && !isMenuOpen && !isAccountOpen ? styles.headerHidden : ''
      }`}
    >
      {/* ── LOGO ── */}
      <div className={styles.logoBlock}>
        <Link to="/" className={styles.logoLink}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>
            ESOTERICON
            <small className={styles.logoTagline}>TAROT · RUNAS · ORÁCULOS</small>
          </span>
        </Link>
      </div>

      {/* ── NAV CENTRAL ── */}
      <nav className={styles.navCenter} aria-label="Navegação principal">
        {!loading && (
          user ? (
            <>
              {/* Dropdown Tarot */}
              <div className={styles.moreWrapper} ref={tarotRef}>
                <button
                  type="button"
                  className={`${styles.navLink} ${styles.moreToggle}`}
                  onClick={() => { closeAllDropdowns(); setIsTarotOpen(p => !p); }}
                  aria-haspopup="menu"
                  aria-expanded={isTarotOpen}
                >
                  Tarot ▾
                </button>
                {isTarotOpen && (
                  <div className={styles.moreMenu} role="menu">
                    <Link to="/tarot" className={styles.moreLink} role="menuitem">Leitura de Tarot</Link>
                    <Link to="/oraculo/dia" className={styles.moreLink} role="menuitem">Carta do Dia</Link>
                    <Link to="/tarot/mapa-do-ano" className={styles.moreLink} role="menuitem">Mapa do Ano</Link>
                    <Link to="/historico" className={styles.moreLink} role="menuitem">Leituras Passadas</Link>
                  </div>
                )}
              </div>

              {/* Dropdown Numerologia */}
              <div className={styles.moreWrapper} ref={numerologyRef}>
                <button
                  type="button"
                  className={`${styles.navLink} ${styles.moreToggle}`}
                  onClick={() => { closeAllDropdowns(); setIsNumerologyOpen(p => !p); }}
                  aria-haspopup="menu"
                  aria-expanded={isNumerologyOpen}
                >
                  Numerologia ▾
                </button>
                {isNumerologyOpen && (
                  <div className={styles.moreMenu} role="menu">
                    <Link to="/numerologia" className={styles.moreLink} role="menuitem">Pessoal</Link>
                    <Link to="/numerologia/compatibilidade" className={styles.moreLink} role="menuitem">Compatibilidade</Link>
                    <Link to="/numerologia/transitos" className={styles.moreLink} role="menuitem">Trânsitos</Link>
                  </div>
                )}
              </div>

              <NavLink to="/runas" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Runas</NavLink>

              {/* Dropdown I Ching */}
              <div className={styles.moreWrapper} ref={ichingRef}>
                <button
                  type="button"
                  className={`${styles.navLink} ${styles.moreToggle}`}
                  onClick={() => { closeAllDropdowns(); setIsIChingOpen(p => !p); }}
                  aria-haspopup="menu"
                  aria-expanded={isIChingOpen}
                >
                  I Ching ▾
                </button>
                {isIChingOpen && (
                  <div className={styles.moreMenu} role="menu">
                    <Link to="/iching" className={styles.moreLink} role="menuitem">Semanal</Link>
                    <Link to="/iching/consulta" className={styles.moreLink} role="menuitem">Consulta Ativa</Link>
                  </div>
                )}
              </div>

              <NavLink to="/oraculo/geral" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Síntese Semanal</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/tarot" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Tarot</NavLink>
              <NavLink to="/biblioteca" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>Biblioteca</NavLink>
            </>
          )
        )}
      </nav>

      {/* ── AÇÕES DIREITA ── */}
      <div className={styles.navRight}>
        {!loading && (
          <>
            {user ? (
              <>
                <Link to="/tarot" className={styles.ctaButton}>
                  <span className={styles.ctaFull}>Fazer leitura</span>
                  <span className={styles.ctaShort}>✦</span>
                </Link>

                <div className={styles.accountWrapper} ref={accountRef}>
                  <button
                    type="button"
                    className={`${styles.accountButton} ${isAccountAnimating ? styles.accountButtonActive : ''}`}
                    onClick={handleAccountToggle}
                    aria-haspopup="menu"
                    aria-expanded={isAccountOpen}
                    aria-label="Menu do perfil"
                  >
                    <svg className={styles.accountIcon} viewBox="0 0 64 64" role="presentation" aria-hidden="true">
                      <polygon
                        points="32 6 38.5 24 57 24 42 35.5 47.5 54 32 43 16.5 54 22 35.5 7 24 25.5 24"
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"
                      />
                      <circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  {isAccountOpen && (
                    <div className={styles.accountMenu} role="menu">
                      <Link to="/perfil" role="menuitem" className={styles.accountMenuLink} state={{ from: location.pathname }}>
                        Meu Perfil
                      </Link>
                      <Link to="/biblioteca" role="menuitem" className={styles.accountMenuLink}>
                        Biblioteca
                      </Link>
                      <Link to="/historico" role="menuitem" className={styles.accountMenuLink}>
                        Histórico
                      </Link>
                      <Link to="/perfil/editar" role="menuitem" className={styles.accountMenuLink} state={{ from: location.pathname }}>
                        Configurações
                      </Link>
                      <button type="button" role="menuitem" className={styles.accountMenuLink} onClick={signOut}>
                        Sair
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile hamburger */}
                <button
                  type="button"
                  className={styles.menuButton}
                  onClick={handleToggleMenu}
                  aria-label="Abrir menu"
                  aria-expanded={isMenuOpen}
                  aria-controls="menu-interno"
                >
                  <span className={styles.menuIcon} />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}>
                  Entrar
                </NavLink>
                <NavLink to="/tarot" className={styles.ctaButton}>
                  Fazer leitura ✦
                </NavLink>
              </>
            )}
          </>
        )}
      </div>

      {/* ── MOBILE MENU ── */}
      {user && (
        <div id="menu-interno" className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <div className={styles.mobileMenuContent}>
            <p className={styles.mobileSectionLabel}>Tarot</p>
            <NavLink to="/tarot" className={styles.mobileLink} onClick={handleCloseMenu}>Leitura de Tarot</NavLink>
            <NavLink to="/oraculo/dia" className={styles.mobileLink} onClick={handleCloseMenu}>Carta do Dia</NavLink>
            <NavLink to="/tarot/mapa-do-ano" className={styles.mobileLink} onClick={handleCloseMenu}>Mapa do Ano</NavLink>
            <NavLink to="/historico" className={styles.mobileLink} onClick={handleCloseMenu}>Leituras Passadas</NavLink>
            <div className={styles.mobileDivider} />
            <p className={styles.mobileSectionLabel}>Numerologia</p>
            <NavLink to="/numerologia" className={styles.mobileLink} onClick={handleCloseMenu}>Pessoal</NavLink>
            <NavLink to="/numerologia/compatibilidade" className={styles.mobileLink} onClick={handleCloseMenu}>Compatibilidade</NavLink>
            <NavLink to="/numerologia/transitos" className={styles.mobileLink} onClick={handleCloseMenu}>Trânsitos</NavLink>
            <div className={styles.mobileDivider} />
            <p className={styles.mobileSectionLabel}>Runas</p>
            <NavLink to="/runas" className={styles.mobileLink} onClick={handleCloseMenu}>Semanal</NavLink>
            <div className={styles.mobileDivider} />
            <p className={styles.mobileSectionLabel}>I Ching</p>
            <NavLink to="/iching" className={styles.mobileLink} onClick={handleCloseMenu}>Semanal</NavLink>
            <NavLink to="/iching/consulta" className={styles.mobileLink} onClick={handleCloseMenu}>Consulta Ativa</NavLink>
            <div className={styles.mobileDivider} />
            <NavLink to="/oraculo/geral" className={styles.mobileLink} onClick={handleCloseMenu}>Síntese Semanal</NavLink>
            <NavLink to="/perfil" className={styles.mobileLink} onClick={handleCloseMenu}>Meu Espaço</NavLink>
            <NavLink to="/biblioteca" className={styles.mobileLink} onClick={handleCloseMenu}>Biblioteca</NavLink>
            <NavLink to="/perfil/editar" className={styles.mobileLink} onClick={handleCloseMenu}>Configurações</NavLink>
            <button type="button" className={styles.mobileGhostButton} onClick={signOut}>Sair</button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
