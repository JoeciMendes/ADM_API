
import React, { useState, useEffect } from 'react';
import { Page, DashboardView, AppState } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogoutModal from './components/LogoutModal';
import { supabase, hasSupabaseEnv } from './services/supabase';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isDarkMode: false,
    currentPage: Page.LOGIN,
    currentView: DashboardView.OVERVIEW,
    user: null,
    isLogoutModalOpen: false,
  });

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(prev => ({
          ...prev,
          currentPage: Page.DASHBOARD,
          user: session.user.email ?? 'Usuário'
        }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setState(prev => ({
          ...prev,
          currentPage: Page.DASHBOARD,
          user: session.user.email ?? 'Usuário'
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentPage: Page.LOGIN,
          user: null,
          isLogoutModalOpen: false
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const handleLogin = (username: string) => {
    setState(prev => ({ ...prev, currentPage: Page.DASHBOARD, user: username }));
  };

  const handleViewChange = (view: DashboardView) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const openLogoutModal = () => {
    setState(prev => ({ ...prev, isLogoutModalOpen: true }));
  };

  const closeLogoutModal = () => {
    setState(prev => ({ ...prev, isLogoutModalOpen: false }));
  };

  const confirmLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair:', error.message);
    }
    // State will be updated by the listener, but we can clear it immediately for better UX
    setState(prev => ({
      ...prev,
      currentPage: Page.LOGIN,
      currentView: DashboardView.OVERVIEW,
      user: null,
      isLogoutModalOpen: false,
    }));
  };

  if (!hasSupabaseEnv) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative concrete-texture">
        <div className="w-full max-w-2xl bg-surface-light dark:bg-zinc-800 border-4 border-black dark:border-white shadow-brutal p-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">Configuração Incompleta</h1>
          <p className="text-sm font-mono uppercase opacity-80 mb-6">
            Defina as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de deploy.
          </p>
          <div className="text-left bg-black text-white p-4 border-2 border-black font-mono text-xs">
            <div>VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=SEU_ANON_KEY</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen relative concrete-texture">
      {state.currentPage === Page.LOGIN && (
        <LoginPage onLogin={handleLogin} />
      )}

      {state.currentPage === Page.DASHBOARD && (
        <DashboardPage
          user={state.user || 'Admin'}
          activeView={state.currentView}
          isDarkMode={state.isDarkMode}
          onViewChange={handleViewChange}
          onLogout={openLogoutModal}
          onToggleTheme={toggleTheme}
        />
      )}

      {state.isLogoutModalOpen && (
        <LogoutModal
          onConfirm={confirmLogout}
          onCancel={closeLogoutModal}
        />
      )}
    </div>
  );
};

export default App;
