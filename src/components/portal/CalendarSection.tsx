/**
 * Calendar Section Component
 * Embeds Google Calendar for scheduling calls
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const CalendarSection: React.FC = () => {
  const [calendarId, setCalendarId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCalendarId();
  }, []);

  const fetchCalendarId = async () => {
    try {
      const { data, error } = await supabase
        .from('portal_settings')
        .select('setting_value')
        .eq('setting_key', 'google_calendar_id')
        .single();

      if (!error && data) {
        setCalendarId(data.setting_value);
      }
    } catch (error) {
      console.error('Error fetching calendar ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Google Calendar appointment scheduling URL
  const getCalendarUrl = () => {
    if (!calendarId || calendarId === 'YOUR_CALENDAR_ID_HERE') {
      return null;
    }
    return `https://calendar.google.com/calendar/appointments/schedules/${calendarId}`;
  };

  const calendarUrl = getCalendarUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Agende uma Call
          </h3>
          <p className="text-sm text-muted-foreground">
            Reserve um horário para tirar dúvidas com nosso time
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Video className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Reunião Online</p>
            <p className="text-xs text-muted-foreground">Google Meet ou Microsoft Teams</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Duração Flexível</p>
            <p className="text-xs text-muted-foreground">30 ou 60 minutos conforme necessidade</p>
          </div>
        </div>
      </div>

      {/* Important note */}
      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 mb-6">
        <p className="text-sm text-foreground">
          <strong className="text-accent">💡 Importante:</strong> Este agendamento é para tirar
          dúvidas sobre funcionalidades, entender temas específicos ou pedir orientações.
          <span className="block mt-1 text-muted-foreground">
            Para tratar de tickets abertos, utilize a Central do Cliente.
          </span>
        </p>
      </div>

      {/* Calendar embed or button */}
      {isLoading ? (
        <div className="h-32 rounded-xl animate-shimmer" />
      ) : calendarUrl ? (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-premium w-full flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Agendar Horário
          <ArrowRight className="w-4 h-4" />
        </a>
      ) : (
        <div className="p-6 rounded-xl bg-muted/50 text-center">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            O agendamento estará disponível em breve.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Entre em contato conosco para mais informações.
          </p>
        </div>
      )}
    </motion.div>
  );
};
