import { useEffect } from 'react';

const BASE = 'Esotericon';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE;
    return () => {
      document.title = BASE;
    };
  }, [title]);
}
