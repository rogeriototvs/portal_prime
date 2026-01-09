/**
 * Admin Page
 * Admin dashboard for managing T-codes, announcements, and settings
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Bell,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  LogOut,
  ArrowLeft,
  Calendar,
  MessageSquareText,
  RefreshCw,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type Tab = 'codes' | 'announcements' | 'events' | 'feedback' | 'settings';

interface TCode {
  id: string;
  t_code: string;
  company_name: string | null;
  is_active: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  priority: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

interface FeedbackItem {
  id: string;
  t_code: string;
  kind: 'complaint' | 'compliment';
  subject: string | null;
  message: string;
  contact_email: string | null;
  created_at: string;
}

const Admin: React.FC = () => {
  const { isAdminAuthenticated, isLoading, loginAdmin, logoutAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<Tab>('codes');
  const [tCodes, setTCodes] = useState<TCode[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [calendarId, setCalendarId] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form states
  const [newTCode, setNewTCode] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 0 });
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    starts_at: '',
    ends_at: '',
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchData();
    }
  }, [isAdminAuthenticated]);

  const fetchData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTCodes(), fetchAnnouncements(), fetchEvents(), fetchFeedback(), fetchSettings()]);
    setIsRefreshing(false);
  };

  const fetchTCodes = async () => {
    const { data } = await supabase
      .from('authorized_codes')
      .select('*')
      .order('t_code');
    if (data) setTCodes(data);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('priority', { ascending: false });
    if (data) setAnnouncements(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true });
    if (data) setEvents(data as unknown as EventItem[]);
  };

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFeedbackItems(data as unknown as FeedbackItem[]);
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este feedback?')) return;
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (!error) fetchFeedback();
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('portal_settings')
      .select('*')
      .eq('setting_key', 'google_calendar_id')
      .single();
    if (data) setCalendarId(data.setting_value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const result = await loginAdmin(email, password);
    if (!result.success) {
      setLoginError(result.error || 'Erro ao fazer login');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logoutAdmin();
  };

  const handleAddTCode = async () => {
    if (!newTCode.trim()) return;

    const { error } = await supabase.from('authorized_codes').insert({
      t_code: newTCode.trim().toUpperCase(),
      company_name: newCompanyName.trim() || null,
    });

    if (!error) {
      setNewTCode('');
      setNewCompanyName('');
      fetchTCodes();
    }
  };

  const handleDeleteTCode = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este código?')) return;
    
    const { error } = await supabase.from('authorized_codes').delete().eq('id', id);
    if (!error) fetchTCodes();
  };

  const handleToggleTCode = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('authorized_codes')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (!error) fetchTCodes();
  };

  const handleSaveAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    if (editingAnnouncement) {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority,
        })
        .eq('id', editingAnnouncement.id);

      if (!error) {
        setEditingAnnouncement(null);
        setNewAnnouncement({ title: '', content: '', priority: 0 });
        fetchAnnouncements();
      }
    } else {
      const { error } = await supabase.from('announcements').insert(newAnnouncement);
      if (!error) {
        setNewAnnouncement({ title: '', content: '', priority: 0 });
        fetchAnnouncements();
      }
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
    });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este comunicado?')) return;
    
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) fetchAnnouncements();
  };

  const handleToggleAnnouncement = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (!error) fetchAnnouncements();
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.starts_at) return;

    const startsAtIso = new Date(newEvent.starts_at).toISOString();
    const endsAtIso = newEvent.ends_at ? new Date(newEvent.ends_at).toISOString() : null;

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          title: newEvent.title.trim(),
          description: newEvent.description.trim() || null,
          location: newEvent.location.trim() || null,
          starts_at: startsAtIso,
          ends_at: endsAtIso,
        })
        .eq('id', editingEvent.id);

      if (!error) {
        setEditingEvent(null);
        setNewEvent({ title: '', description: '', location: '', starts_at: '', ends_at: '' });
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from('events').insert({
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        location: newEvent.location.trim() || null,
        starts_at: startsAtIso,
        ends_at: endsAtIso,
      });

      if (!error) {
        setNewEvent({ title: '', description: '', location: '', starts_at: '', ends_at: '' });
        fetchEvents();
      }
    }
  };

  const handleEditEvent = (eventItem: EventItem) => {
    const toDatetimeLocal = (iso: string | null) => {
      if (!iso) return '';
      const date = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
        date.getHours()
      )}:${pad(date.getMinutes())}`;
    };

    setEditingEvent(eventItem);
    setNewEvent({
      title: eventItem.title,
      description: eventItem.description ?? '',
      location: eventItem.location ?? '',
      starts_at: toDatetimeLocal(eventItem.starts_at),
      ends_at: toDatetimeLocal(eventItem.ends_at),
    });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este evento?')) return;

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) fetchEvents();
  };

  const handleToggleEvent = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (!error) fetchEvents();
  };

  const handleSaveCalendarId = async () => {
    const { error } = await supabase
      .from('portal_settings')
      .upsert({ setting_key: 'google_calendar_id', setting_value: calendarId });
    
    if (!error) {
      alert('ID da agenda atualizado com sucesso!');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Login form
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen hero-section flex flex-col">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card shadow-md hover:shadow-lg transition-all"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card shadow-md hover:shadow-lg transition-all text-sm font-medium text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-premium mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Área Administrativa
              </h1>
              <p className="text-muted-foreground">
                Acesso restrito aos administradores
              </p>
            </div>

            <div className="premium-card">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium"
                    required
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn-premium w-full"
                >
                  {isLoggingIn ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-foreground">
                    Painel Admin
                  </h1>
                  <p className="text-xs text-muted-foreground">Prime Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'codes', label: 'Códigos T', icon: Users },
              { id: 'announcements', label: 'Comunicados', icon: Bell },
              { id: 'events', label: 'Eventos', icon: Calendar },
              { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* T-Codes Tab */}
        {activeTab === 'codes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Add new code form */}
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">Adicionar Novo Código</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Código T (ex: T12345)"
                  value={newTCode}
                  onChange={(e) => setNewTCode(e.target.value.toUpperCase())}
                  className="input-premium flex-1"
                />
                <input
                  type="text"
                  placeholder="Nome da empresa (opcional)"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="input-premium flex-1"
                />
                <button onClick={handleAddTCode} className="btn-premium whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Codes list */}
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">
                Códigos Autorizados ({tCodes.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tCodes.map((code) => (
                  <div
                    key={code.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      code.is_active
                        ? 'bg-muted/50 border-border'
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-semibold text-foreground">
                        {code.t_code}
                      </span>
                      {code.company_name && (
                        <span className="text-sm text-muted-foreground ml-2">
                          • {code.company_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTCode(code.id, code.is_active)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          code.is_active
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {code.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => handleDeleteTCode(code.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Add/Edit announcement form */}
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">
                {editingAnnouncement ? 'Editar Comunicado' : 'Novo Comunicado'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  className="input-premium"
                />
                <textarea
                  placeholder="Conteúdo do comunicado..."
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                  }
                  rows={4}
                  className="input-premium resize-none"
                />
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-muted-foreground mb-1">
                      Prioridade (maior = mais importante)
                    </label>
                    <input
                      type="number"
                      value={newAnnouncement.priority}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          priority: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input-premium"
                    />
                  </div>
                  <div className="flex gap-2 pt-6">
                    {editingAnnouncement && (
                      <button
                        onClick={() => {
                          setEditingAnnouncement(null);
                          setNewAnnouncement({ title: '', content: '', priority: 0 });
                        }}
                        className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={handleSaveAnnouncement} className="btn-premium">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements list */}
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">
                Comunicados ({announcements.length})
              </h3>
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-xl border ${
                      announcement.is_active
                        ? 'bg-muted/50 border-border'
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {announcement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {announcement.content}
                        </p>
                        <span className="text-xs text-muted-foreground/60 mt-2 inline-block">
                          Prioridade: {announcement.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active)}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            announcement.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {announcement.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                        <button
                          onClick={() => handleEditAnnouncement(announcement)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Add/Edit event form */}
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="input-premium"
                />

                <textarea
                  placeholder="Descrição (opcional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="input-premium resize-none"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Início</label>
                    <input
                      type="datetime-local"
                      value={newEvent.starts_at}
                      onChange={(e) => setNewEvent({ ...newEvent, starts_at: e.target.value })}
                      className="input-premium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Fim (opcional)</label>
                    <input
                      type="datetime-local"
                      value={newEvent.ends_at}
                      onChange={(e) => setNewEvent({ ...newEvent, ends_at: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Local (opcional)"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="input-premium"
                />

                <div className="flex items-center justify-end gap-2">
                  {editingEvent && (
                    <button
                      onClick={() => {
                        setEditingEvent(null);
                        setNewEvent({ title: '', description: '', location: '', starts_at: '', ends_at: '' });
                      }}
                      className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={handleSaveEvent} className="btn-premium">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </button>
                </div>
              </div>
            </div>

            {/* Events list */}
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">
                Eventos ({events.length})
              </h3>
              <div className="space-y-3">
                {events.map((eventItem) => (
                  <div
                    key={eventItem.id}
                    className={`p-4 rounded-xl border ${
                      eventItem.is_active
                        ? 'bg-muted/50 border-border'
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{eventItem.title}</h4>
                        {(eventItem.description || eventItem.location) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {eventItem.description ? eventItem.description : eventItem.location}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {new Date(eventItem.starts_at).toLocaleString('pt-BR')}
                          {eventItem.ends_at ? ` • até ${new Date(eventItem.ends_at).toLocaleString('pt-BR')}` : ''}
                        </p>
                        {eventItem.location && eventItem.description && (
                          <p className="text-xs text-muted-foreground/70 mt-1">Local: {eventItem.location}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleEvent(eventItem.id, eventItem.is_active)}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            eventItem.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {eventItem.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                        <button
                          onClick={() => handleEditEvent(eventItem)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(eventItem.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {events.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Nenhum evento cadastrado ainda.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="premium-card">
              <h3 className="font-semibold text-foreground mb-4">
                Feedback ({feedbackItems.length})
              </h3>
              <div className="space-y-3">
                {feedbackItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border bg-muted/50 border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              item.kind === 'complaint'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-success/10 text-success'
                            }`}
                          >
                            {item.kind === 'complaint' ? 'Reclamação' : 'Elogio'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-foreground">
                          <span className="font-semibold">Código:</span> {item.t_code}
                        </div>
                        {item.subject && (
                          <div className="mt-1 text-sm text-foreground">
                            <span className="font-semibold">Assunto:</span> {item.subject}
                          </div>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                          {item.message}
                        </p>
                        {item.contact_email && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Contato:</span> {item.contact_email}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {feedbackItems.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Nenhum feedback recebido ainda.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Google Calendar
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o ID da agenda para agendamentos
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ID do Appointment Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: AcZssZ1Ld..."
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                    className="input-premium"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Encontre o ID no Google Calendar → Agendamentos → Compartilhar → Página de reservas.
                    O ID está no final da URL após /schedules/
                  </p>
                </div>

                <button onClick={handleSaveCalendarId} className="btn-premium">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Admin;
