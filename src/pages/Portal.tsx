/**
 * Portal Page
 * Main dashboard for authenticated clients
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import {
  GraduationCap,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/portal/Header';
import { LinkCard } from '@/components/portal/LinkCard';
import { CalendarSection } from '@/components/portal/CalendarSection';
import { AnnouncementBanner } from '@/components/portal/AnnouncementBanner';
import { AnnouncementModal } from '@/components/portal/AnnouncementModal';

// Quick access links configuration
const quickLinks = [
  {
    title: 'TOTVS Fluig Academy',
    description: 'Cursos e treinamentos oficiais',
    href: 'https://academy.fluig.com/',
    icon: GraduationCap,
  },
  {
    title: 'Fórum Fluig Oficial',
    description: 'Comunidade e discussões',
    href: 'https://forum.totvs.io/',
    icon: MessageSquare,
  },
  {
    title: 'Documentação TDN',
    description: 'Documentação técnica oficial',
    href: 'https://tdn.totvs.com/pages/releaseview.action?pageId=234457027',
    icon: BookOpen,
  },
  {
    title: 'Central de FAQs',
    description: 'Base de conhecimento Fluig',
    href: 'https://centraldeatendimento.totvs.com/hc/pt-br/sections/27653283587223-TOTVS-Fluig-Plataforma',
    icon: HelpCircle,
  },
];

const Portal: React.FC = () => {
  const { isClientAuthenticated, clientTCode } = useAuth();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(true);

  // Redirect if not authenticated
  if (!isClientAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleViewAllAnnouncements = () => {
    setShowAnnouncementModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
      />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="premium-badge">
              <Sparkles className="w-3 h-3" />
              Cliente Prime
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Bem-vindo ao Portal Prime
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seu acesso exclusivo a recursos, documentação e suporte especializado
            do time TOTVS Fluig Prime.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Links */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Access Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Acesso Rápido
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <LinkCard
                    key={link.title}
                    title={link.title}
                    description={link.description}
                    href={link.href}
                    icon={link.icon}
                    delay={0.2 + index * 0.1}
                  />
                ))}
              </div>
            </motion.div>

            {/* Calendar Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CalendarSection />
            </motion.div>
          </div>

          {/* Right Column - Announcements */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AnnouncementBanner onViewAll={handleViewAllAnnouncements} />
            </motion.div>

            {/* Support Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="premium-card text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mx-auto mb-4">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                Precisa de Ajuda?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                O time Prime está aqui para você. Agende uma call ou entre em
                contato para suporte especializado.
              </p>
              <p className="text-xs text-muted-foreground">
                Código: <span className="font-semibold text-foreground">{clientTCode}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TOTVS Fluig Prime • Portal Exclusivo para Clientes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portal;
