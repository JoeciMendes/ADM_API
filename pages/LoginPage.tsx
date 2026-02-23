
import React, { useState } from 'react';
import BrutalInput from '../components/BrutalInput';
import BrutalButton from '../components/BrutalButton';
import { signIn, signUp } from '../services/appwrite';

interface LoginPageProps {
  onLogin: (user: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, pass);
        alert('Cadastro realizado! Faça login para continuar.');
      } else {
        const user = await signIn(email, pass);
        if (user) {
          onLogin(user.email || 'Usuário');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md">
        <div className="bg-surface-light dark:bg-zinc-800 border-4 border-black dark:border-white shadow-brutal p-8 md:p-10 relative">
          {/* Blocos Decorativos */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-black dark:bg-white"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black dark:bg-white"></div>

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-black dark:text-white mb-2">
              {isSignUp ? 'CADASTRAR' : 'ENTRAR'}
            </h1>
            <div className="h-1 w-full bg-black dark:bg-white mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">
              {isSignUp ? 'Criar Nova Identidade' : 'Acesso Administrativo'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-retro-red text-white border-4 border-black font-bold uppercase text-xs animate-shake">
              ERRO_SISTEMA: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <BrutalInput
              label="E-mail de Acesso"
              placeholder="seu@email.com"
              icon="mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <BrutalInput
              label="Senha de Acesso"
              type="password"
              placeholder="••••••••"
              icon="lock"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />

            <div className="pt-4">
              <BrutalButton type="submit" disabled={loading}>
                {loading ? 'PROCESSANDO...' : isSignUp ? 'CRIAR CONTA' : 'ACESSAR'}
                {!loading && <span className="material-icons align-middle ml-1 text-xl">arrow_forward</span>}
              </BrutalButton>
            </div>

            <div className="flex flex-col gap-4 items-center pt-6 text-xs font-bold uppercase">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-black dark:text-white hover:underline decoration-2 decoration-primary underline-offset-4"
              >
                {isSignUp ? 'JÁ POSSUI CONTA? ENTRAR AGORA' : 'NÃO TEM CONTA? CADASTRAR-SE'}
              </button>

              {!isSignUp && (
                <div className="flex justify-between w-full opacity-60">
                  <a className="hover:underline" href="#">Esqueceu a senha?</a>
                  <a className="hover:underline" href="#">Ajuda?</a>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Exibição da Paleta de Cores */}
        <div className="mt-8 grid grid-cols-4 border-2 border-black dark:border-white shadow-brutal h-12">
          <div className="bg-zinc-800 border-r-2 border-black dark:border-white"></div>
          <div className="bg-accent-orange border-r-2 border-black dark:border-white"></div>
          <div className="bg-retro-red border-r-2 border-black dark:border-white"></div>
          <div className="bg-retro-blue"></div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] uppercase text-gray-500 dark:text-gray-500">Sistema v2.0.4 — Conexão Segura</p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
