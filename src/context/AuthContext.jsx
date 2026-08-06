// src/context/AuthContext.jsx - VERSÃO COM PERFIL INTEGRADO
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // O user da autenticação (auth.users)
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // O perfil da tabela 'profiles' costumava ser buscado aqui a cada evento
  // de auth, mas nenhum componente lê `profile` deste contexto — todos usam
  // o hook useUserProfile (React Query) separado. Era uma requisição
  // desperdiçada em todo login/refresh de sessão.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = {
    user, // O objeto de autenticação (user.id, user.email)
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
