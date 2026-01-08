/**
 * Announcement Modal Component
 * Displays important announcements when clients access the portal
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  created_at: string;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && currentAnnouncement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-premium-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="announcement-card rounded-b-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Comunicado Prime</p>
                    <h3 className="text-lg font-bold">{currentAnnouncement.title}</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {currentAnnouncement.content}
              </p>

              {/* Pagination indicator */}
              {announcements.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {announcements.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'w-6 bg-primary'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fechar
                </button>
                {currentIndex < announcements.length - 1 ? (
                  <button onClick={handleNext} className="btn-premium text-sm">
                    Próximo
                  </button>
                ) : (
                  <button onClick={onClose} className="btn-premium text-sm">
                    Entendi
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
