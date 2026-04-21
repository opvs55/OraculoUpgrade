// src/utils/logger.js
// Sistema de logging condicional para produção

const isDev = import.meta.env.DEV;

const logger = {
  log: isDev ? console.log : () => {},
  warn: isDev ? console.warn : () => {},
  error: isDev ? console.error : () => {},
  debug: isDev ? console.debug : () => {},
  info: isDev ? console.info : () => {},
  
  // Métodos específicos para contexto
  auth: {
    log: isDev ? (...args) => console.log('[AUTH]', ...args) : () => {},
    error: isDev ? (...args) => console.error('[AUTH]', ...args) : () => {},
  },
  api: {
    log: isDev ? (...args) => console.log('[API]', ...args) : () => {},
    error: isDev ? (...args) => console.error('[API]', ...args) : () => {},
  },
  tarot: {
    log: isDev ? (...args) => console.log('[TAROT]', ...args) : () => {},
    error: isDev ? (...args) => console.error('[TAROT]', ...args) : () => {},
  }
};

export default logger;
