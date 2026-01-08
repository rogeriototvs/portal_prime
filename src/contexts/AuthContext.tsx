/**
 * Authentication Context for TOTVS Fluig Prime Portal
 * Handles both T-code client authentication and admin user authentication
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  // Client (T-code) authentication
  isClientAuthenticated: boolean;
  clientTCode: string | null;
  authenticateClient: (tCode: string) => Promise<boolean>;
  logoutClient: () => void;
  
  // Admin authentication
  isAdminAuthenticated: boolean;
  adminUser: User | null;
  isAdmin: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(false);
  const [clientTCode, setClientTCode] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing client session
  useEffect(() => {
    const storedTCode = sessionStorage.getItem('prime_client_tcode');
    if (storedTCode) {
      setClientTCode(storedTCode);
      setIsClientAuthenticated(true);
    }
    checkAdminSession();
  }, []);

  // Check admin session
  const checkAdminSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAdminUser(session.user);
        await checkIsAdmin(session.user.id);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin
  const checkIsAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      setIsAdmin(!error && !!data);
    } catch {
      setIsAdmin(false);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAdminUser(session.user);
          await checkIsAdmin(session.user.id);
        } else {
          setAdminUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Authenticate client with T-code
  const authenticateClient = async (tCode: string): Promise<boolean> => {
    try {
      const normalizedCode = tCode.trim().toUpperCase();
      
      const { data, error } = await supabase
        .from('authorized_codes')
        .select('t_code, is_active')
        .eq('t_code', normalizedCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return false;
      }

      // Create session record
      await supabase
        .from('client_sessions')
        .insert({ t_code: normalizedCode });

      // Store in session
      sessionStorage.setItem('prime_client_tcode', normalizedCode);
      setClientTCode(normalizedCode);
      setIsClientAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Error authenticating client:', error);
      return false;
    }
  };

  // Logout client
  const logoutClient = () => {
    sessionStorage.removeItem('prime_client_tcode');
    setClientTCode(null);
    setIsClientAuthenticated(false);
  };

  // Login admin
  const loginAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          return { success: false, error: 'Acesso não autorizado. Apenas administradores podem acessar.' };
        }

        setAdminUser(data.user);
        setIsAdmin(true);
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  // Logout admin
  const logoutAdmin = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isClientAuthenticated,
        clientTCode,
        authenticateClient,
        logoutClient,
        isAdminAuthenticated: !!adminUser && isAdmin,
        adminUser,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
