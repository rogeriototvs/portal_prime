/**
 * Announcement Banner Component
 * Displays announcements in a fixed section on the portal
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  created_at: string;
}

interface AnnouncementBannerProps {
  onViewAll: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ onViewAll }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      setAnnouncements(data);
    }
  };

  if (announcements.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
            <Bell className="w-4 h-4 text-accent" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Comunicados</h3>
          <span className="premium-badge text-xs">
            <Sparkles className="w-3 h-3" />
            Novidades
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-all cursor-pointer group"
            onClick={onViewAll}
          >
            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {announcement.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {announcement.content}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {new Date(announcement.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
