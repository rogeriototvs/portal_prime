/**
 * Portal Header Component
 * Premium header with logo, theme toggle, and user info
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, LogOut, Shield, MessageSquareText } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { clientTCode, logoutClient, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutClient();
    navigate('/');
  };

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 glass-card border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg">
              P
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-lg">
                Prime Portal
              </h1>
              <p className="text-xs text-muted-foreground">TOTVS Fluig</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Client code badge */}
            {clientTCode && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <span className="text-xs text-muted-foreground">Código:</span>
                <span className="text-sm font-semibold text-foreground">{clientTCode}</span>
              </div>
            )}

            {/* Admin access */}
            <button
              onClick={handleAdminAccess}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title="Acesso Admin"
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Feedback */}
            <button
              onClick={() => navigate('/feedback')}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title="Enviar elogio ou reclamação"
            >
              <MessageSquareText className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
