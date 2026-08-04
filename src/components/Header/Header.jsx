import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAutoHideHeader } from '../../hooks/useAutoHideHeader';
import styles from './Header.module.css';

// Estrutura única do menu — usada tanto no nav desktop (com dropdowns) quanto
// no menu mobile. Fica visível pra qualquer visitante, logado ou não: as
// rotas que exigem conta redirecionam pro login sozinhas via ProtectedRoute.
const NAV_MENU = [
  {
    key: 'tarot',
    label: 'Tarot',
    items: [
      { label: 'Leitura de Tarot', to: '/tarot' },
      { label: 'Carta do Dia', to: '/oraculo/dia' },
      { label: 'Mapa do Ano', to: '/tarot/mapa-do-ano' },
      { label: 'Leituras Passadas', to: '/historico' },
    ],
  },
  {
    key: 'numerologia',
    label: 'Numerologia',
    items: [
      { label: 'Pessoal', to: '/numerologia' },
      { label: 'Compatibilidade', to: '/numerologia/compatibilidade' },
      { label: 'Trânsitos', to: '/numerologia/transitos' },
    ],
  },
  { key: 'runas', label: 'Runas', to: '/runas' },
  {
    key: 'iching',
    label: 'I Ching',
    items: [
      { label: 'Semanal', to: '/iching' },
      { label: 'Consulta Ativa', to: '/iching/consulta' },
    ],
  },
  { key: 'sintese', label: 'Síntese Semanal', to: '/oraculo/geral' },
];

function NavDropdown({ entry, isOpen, onToggle, dropdownRef }) {
  if (!entry.items) {
    return (
      <NavLink
        to={entry.to}
        className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink)}
      >
        {entry.label}
      </NavLink>
    );
  }

  return (
    <div className={styles.leftDropdownWrapper} ref={isOpen ? dropdownRef : null}>
      <button
        type="button"
        className={styles.navLink}
        onClick={() => onToggle(entry.key)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {entry.label} ▾
      </button>
      {isOpen && (
        <div className={styles.leftDropdownMenu} role="menu">
          {entry.items.map((item) => (
            <NavLink key={item.to} to={item.to} className={styles.accountMenuLink} role="menuitem">
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [openNavKey, setOpenNavKey] = useState(null);

  const accountRef = useRef(null);
  const navDropdownRef = useRef(null);
  const accountAnimationTimeout = useRef(null);
  const [isAccountAnimating, setIsAccountAnimating] = useState(false);

  const { isHidden, reveal } = useAutoHideHeader(false);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);
  const handleToggleNav = (key) => setOpenNavKey((prev) => (prev === key ? null : key));

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
    setOpenNavKey(null);
  }, [location.pathname]);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        setOpenNavKey(null);
      }
    };

    if (isAccountOpen || openNavKey) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAccountOpen, openNavKey]);

  // Revela o header se algum menu estiver aberto
  useEffect(() => {
    if (isMenuOpen || isAccountOpen || openNavKey) {
      reveal();
    }
  }, [isMenuOpen, isAccountOpen, openNavKey, reveal]);

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
        isHidden && !isMenuOpen && !isAccountOpen && !openNavKey ? styles.headerHidden : ''
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
            <small className={styles.logoTagline}>TAROT · RUNAS · ORÁCULOS</small>
          </span>
        </Link>
      </div>

      <nav className={styles.navCenter} aria-label="Navegação principal">
        {NAV_MENU.map((entry) => (
          <NavDropdown
            key={entry.key}
            entry={entry}
            isOpen={openNavKey === entry.key}
            onToggle={handleToggleNav}
            dropdownRef={navDropdownRef}
          />
        ))}

        {!loading && user && (
          <NavLink
            to="/meu-grimorio"
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink)}
          >
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
                <NavLink
                  to="/login"
                  className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink)}
                >
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
          {NAV_MENU.flatMap((entry) => (entry.items ? entry.items : [{ label: entry.label, to: entry.to }])).map(
            (item) => (
              <NavLink key={item.to} to={item.to} className={styles.mobileLink} onClick={handleCloseMenu}>
                {item.label}
              </NavLink>
            ),
          )}
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
