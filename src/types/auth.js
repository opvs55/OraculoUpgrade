// src/types/auth.js
// Type definitions para o sistema de autenticação

/**
 * @typedef {Object} User
 * @property {string} id - ID único do usuário
 * @property {string} email - Email do usuário
 * @property {Date} created_at - Data de criação
 * @property {Date} updated_at - Data de atualização
 */

/**
 * @typedef {Object} Profile
 * @property {string} id - ID do perfil (igual ao user.id)
 * @property {string} username - Nome de usuário único
 * @property {string|null} avatar_url - URL do avatar
 * @property {string|null} full_name - Nome completo
 * @property {string|null} bio - Biografia
 * @property {string|null} minha_historia - História pessoal
 * @property {string|null} entidade_cultuada - Entidade cultuada
 * @property {Date} created_at - Data de criação
 * @property {Date} updated_at - Data de atualização
 */

/**
 * @typedef {Object} AuthContext
 * @property {User|null} user - Dados do usuário autenticado
 * @property {Profile|null} profile - Dados do perfil do usuário
 * @property {boolean} loading - Estado de carregamento
 * @property {Function} signOut - Função para logout
 */

/**
 * @typedef {Object} AuthError
 * @property {string} message - Mensagem de erro
 * @property {string} status - Status do erro
 * @property {string|null} code - Código do erro (se disponível)
 */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid login credentials',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'User already registered',
  WEAK_PASSWORD: 'Password should be at least 6 characters',
  INVALID_EMAIL: 'Unable to validate email address: invalid format',
  RATE_LIMIT: 'Too many requests',
  NETWORK_ERROR: 'Failed to fetch'
};

export const AUTH_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};
