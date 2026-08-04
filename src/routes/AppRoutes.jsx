import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute/ProtectedRoute.jsx';

// 1. O PageLoader continua definido aqui
const PageLoader = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    A carregar...
  </div>
);

// --- 1. MUDANÇA: ProfilePage importado normalmente ---
import ProfilePage from '../pages/profile/ProfilePage';
// --- FIM DA MUDANÇA ---


// --- Páginas Carregadas de forma "Lazy" ---

// Páginas Públicas
const WelcomePage = lazy(() => import('../pages/WelcomePage'));
const TarotPage = lazy(() => import('../pages/TarotPage'));
const NumerologyPage = lazy(() => import('../pages/NumerologyPage.jsx'));
const GeneralOraclePage = lazy(() => import('../pages/GeneralOraclePage'));
const RunesWeeklyPage = lazy(() => import('../pages/RunesWeeklyPage'));
const IChingWeeklyPage = lazy(() => import('../pages/IChingWeeklyPage'));

// Autenticação
const CadastroPage = lazy(() => import('../pages/auth/CadastroPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RequestPasswordResetPage = lazy(() => import('../pages/auth/RequestPasswordResetPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Leitura
const PastReadingPage = lazy(() => import('../pages/reading/PastReadingPage/PastReadingPage'));
const CardDetailPage = lazy(() => import('../pages/reading/CardDetailPage/CardDetailPage'));

// Perfil Público
// const ProfilePage = lazy(() => import('../pages/profile/ProfilePage')); // <-- 2. MUDANÇA: REMOVIDO DAQUI

// Páginas Protegidas (Dashboard, Aprendizagem, Comunidade)
const CardLibraryPage = lazy(() => import('../pages/learning/CardLibraryPage'));
const LearningCardDetailPage = lazy(() => import('../pages/learning/LearningCardDetailPage'));
const MeuGrimorioPage = lazy(() => import('../pages/dashboard/MeuGrimorioPage'));
const EditarPerfilPage = lazy(() => import('../pages/dashboard/EditarPerfilPage'));
const CommunityFeedPage = lazy(() => import('../pages/community/CommunityFeedPage'));

// Features recuperadas (Carta do Dia, Mapa do Ano, Compatibilidade, Trânsitos, I Ching Ativo, Histórico)
const CartaDoDiaPage = lazy(() => import('../pages/features/CartaDoDiaPage'));
const YearMapPage = lazy(() => import('../pages/features/YearMapPage'));
const CompatibilityPage = lazy(() => import('../pages/features/CompatibilityPage'));
const TransitsPage = lazy(() => import('../pages/features/TransitsPage'));
const IChingActivePage = lazy(() => import('../pages/features/IChingActivePage'));
const HistoricoPage = lazy(() => import('../pages/features/HistoricoPage'));

function AppRoutes() {
  return (
    // O Suspense continua para as outras páginas lazy
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- Rotas Públicas --- */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/tarot" element={<TarotPage />} />
        <Route path="/numerologia" element={<NumerologyPage />} />
        
        {/* Rotas de Autenticação */}
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RequestPasswordResetPage />} />
        <Route path="/resetar-senha" element={<ResetPasswordPage />} />
        
        {/* Rotas de Leitura */}
        <Route path="/leitura/:readingId" element={<PastReadingPage />} />
        <Route path="/leitura/:readingId/carta/:position" element={<CardDetailPage />} />
        
        {/* Rota do Perfil Público (Agora sem lazy load) */}
        <Route path="/perfil/:username" element={<ProfilePage />} />

        {/* --- Rotas Protegidas (Agrupadas) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/diario" element={<MeuGrimorioPage />} />
          <Route path="/perfil/editar" element={<EditarPerfilPage />} />
          <Route path="/biblioteca" element={<CardLibraryPage />} />
          <Route path="/biblioteca/:cardSlug" element={<LearningCardDetailPage />} />
          <Route path="/comunidade" element={<CommunityFeedPage />} />
          <Route path="/oraculo/geral" element={<GeneralOraclePage />} />
          <Route path="/oraculo/geral/:id" element={<GeneralOraclePage />} />
          <Route path="/runas" element={<RunesWeeklyPage />} />
          <Route path="/iching" element={<IChingWeeklyPage />} />
          <Route path="/iching/consulta" element={<IChingActivePage />} />
          <Route path="/oraculo/dia" element={<CartaDoDiaPage />} />
          <Route path="/tarot/mapa-do-ano" element={<YearMapPage />} />
          <Route path="/numerologia/compatibilidade" element={<CompatibilityPage />} />
          <Route path="/numerologia/transitos" element={<TransitsPage />} />
          <Route path="/historico" element={<HistoricoPage />} />
        </Route>

      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
