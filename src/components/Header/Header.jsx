import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAutoHideHeader } from '../../hooks/useAutoHideHeader';
import styles from './Header.module.css';

// Nav enxuto e focado em Tarot — usado tanto no desktop quanto no menu
// mobile. As demais leituras (numerologia, runas, i-ching) continuam
// funcionando por URL direta, só não ficam mais em destaque na navegação.
const NAV_MENU = [
  { label: 'Leitura de Tarot', to: '/tarot' },
  { label: 'Carta do Dia', to: '/oraculo/dia' },
  { label: 'Mapa do Ano', to: '/tarot/mapa-do-ano' },
  { label: 'Histórico', to: '/historico' },
];

function Header() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const accountRef = useRef(null);
  const accountAnimationTimeout = useRef(null);
  const [isAccountAnimating, setIsAccountAnimating] = useState(false);

  const { isHidden, reveal } = useAutoHideHeader(false);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  const navLinkClass = ({ isActive }) => (isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink);

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  // Fecha o menu de conta ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    if (isAccountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountOpen]);

  // Revela o header se algum menu estiver aberto
  useEffect(() => {
    if (isMenuOpen || isAccountOpen) {
      reveal();
    }
  }, [isMenuOpen, isAccountOpen, reveal]);

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

  return (
    <header
      className={`${styles.header} ${
        isHidden && !isMenuOpen && !isAccountOpen ? styles.headerHidden : ''
      }`}
    >
      <div className={styles.logoBlock}>
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

        <Link to="/" className={styles.logoLink}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>
            ESOTERICON
            <small className={styles.logoTagline}>LEITURAS DE TAROT COM IA</small>
          </span>
        </Link>
      </div>

      <nav className={styles.navCenter} aria-label="Navegação principal">
        {NAV_MENU.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            {item.label}
          </NavLink>
        ))}

        {!loading && user && (
          <NavLink to="/meu-grimorio" className={navLinkClass}>
            Grimório
          </NavLink>
        )}
      </nav>

      <nav className={styles.navRight} aria-label="Ações do usuário">
        {!loading && (
          <>
            <Link to="/tarot" className={styles.primaryButton}>
              <span className={styles.ctaFull}>Fazer leitura</span>
              <span className={styles.ctaShort}>✦</span>
            </Link>
            {user ? (
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
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <circle cx="32" cy="32" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                {isAccountOpen && (
                  <div className={styles.accountMenu} role="menu">
                    <Link to="/biblioteca" role="menuitem" className={styles.accountMenuLink}>
                      Biblioteca
                    </Link>
                    <Link to="/comunidade" role="menuitem" className={styles.accountMenuLink}>
                      Comunidade
                    </Link>
                    <Link to="/historico" role="menuitem" className={styles.accountMenuLink}>
                      Histórico
                    </Link>
                    <Link to="/perfil/editar" role="menuitem" className={styles.accountMenuLink}>
                      Configurações
                    </Link>
                    <button type="button" role="menuitem" onClick={signOut}>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Entrar
                </NavLink>
                <NavLink to="/cadastro" className={styles.signUpButton}>
                  Cadastrar
                </NavLink>
              </>
            )}
          </>
        )}
      </nav>

      <div id="menu-interno" className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuContent}>
          {NAV_MENU.map((item) => (
            <NavLink key={item.to} to={item.to} className={styles.mobileLink} onClick={handleCloseMenu}>
              {item.label}
            </NavLink>
          ))}
          {user && (
            <>
              <NavLink to="/meu-grimorio" className={styles.mobileLink} onClick={handleCloseMenu}>
                Grimório
              </NavLink>
              <NavLink to="/biblioteca" className={styles.mobileLink} onClick={handleCloseMenu}>
                Biblioteca
              </NavLink>
              <NavLink to="/comunidade" className={styles.mobileLink} onClick={handleCloseMenu}>
                Comunidade
              </NavLink>
              <NavLink to="/perfil/editar" className={styles.mobileLink} onClick={handleCloseMenu}>
                Perfil
              </NavLink>
              <button type="button" className={styles.mobileGhostButton} onClick={signOut}>
                Sair
              </button>
            </>
          )}
          {!user && !loading && (
            <>
              <NavLink to="/login" className={styles.mobileLink} onClick={handleCloseMenu}>
                Entrar
              </NavLink>
              <NavLink to="/cadastro" className={styles.mobileLink} onClick={handleCloseMenu}>
                Cadastrar
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
