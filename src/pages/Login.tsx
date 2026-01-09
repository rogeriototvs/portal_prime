/**
 * Login Page
 * Premium styled login for T-code authentication
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Login: React.FC = () => {
  const [tCode, setTCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticateClient } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tCode.trim()) {
      setError('Por favor, informe seu Código T');
      return;
    }

    setIsLoading(true);

    try {
      const success = await authenticateClient(tCode);
      if (success) {
        navigate('/portal');
      } else {
        setError('Código T não autorizado ou inativo. Verifique com o time Prime.');
      }
    } catch {
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-section flex flex-col">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-card shadow-md hover:shadow-lg transition-all"
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo and title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Prime Portal
            </h1>
            <p className="text-muted-foreground">
              Portal Exclusivo TOTVS Fluig
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="premium-badge">
                <Sparkles className="w-3 h-3" />
                Acesso Exclusivo
              </span>
            </div>
          </div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Acesso ao Portal</h2>
                <p className="text-sm text-muted-foreground">
                  Informe seu Código T para continuar
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tcode" className="block text-sm font-medium text-foreground mb-2">
                  Código T
                </label>
                <input
                  type="text"
                  id="tcode"
                  value={tCode}
                  onChange={(e) => setTCode(e.target.value.toUpperCase())}
                  placeholder="Ex: T12345"
                  className="input-premium uppercase"
                  disabled={isLoading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-premium w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Acessar Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Código T é o seu codigo de cliente TOTVS. Você pode verificar 
                no seu contrato ou acessando a Central do Cliente.
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} TOTVS Fluig Prime • Portal Exclusivo
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
