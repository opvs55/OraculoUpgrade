export function resolveFallbackRoute(pathname = '/') {
  if (pathname.startsWith('/perfil/editar')) return '/perfil';
  if (pathname.startsWith('/perfil')) return '/tarot';
  if (pathname.startsWith('/reels')) return '/perfil';
  if (pathname.startsWith('/oraculo/geral')) return '/perfil';
  if (pathname.startsWith('/runas')) return '/perfil';
  if (pathname.startsWith('/iching')) return '/perfil';
  if (pathname.startsWith('/numerologia')) return '/perfil';
  if (pathname.startsWith('/biblioteca')) return '/perfil';
  if (pathname.startsWith('/leituras-interativas')) return '/perfil';
  if (pathname.startsWith('/tarot')) return '/perfil';
  return '/perfil';
}

function getStateFromPath(location) {
  const maybeFrom = location?.state?.from;
  if (typeof maybeFrom !== 'string') return null;
  if (!maybeFrom.startsWith('/')) return null;
  if (maybeFrom === location.pathname) return null;
  return maybeFrom;
}

export function goBackOrFallback({ navigate, location, fallbackPath }) {
  const stateFrom = getStateFromPath(location);

  if (location.key !== 'default') {
    navigate(-1);
    return;
  }

  if (stateFrom) {
    navigate(stateFrom);
    return;
  }

  navigate(fallbackPath || resolveFallbackRoute(location.pathname));
}
