
import React, { useState, useEffect } from 'react';
import { Page, DashboardView, AppState } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogoutModal from './components/LogoutModal';
import { supabase } from './services/supabase';

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

  return (
    <div className="min-h-screen relative concrete-texture">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex items-center justify-center"
      >
        <span className="material-icons text-black dark:text-white">
          {state.isDarkMode ? 'light_mode' : 'contrast'}
        </span>
      </button>

      {state.currentPage === Page.LOGIN && (
        <LoginPage onLogin={handleLogin} />
      )}

      {state.currentPage === Page.DASHBOARD && (
        <DashboardPage
          user={state.user || 'Admin'}
          activeView={state.currentView}
          onViewChange={handleViewChange}
          onLogout={openLogoutModal}
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
