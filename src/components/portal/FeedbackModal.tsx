/**
 * Feedback Modal Component
 * Allows clients to send a complaint or compliment
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ThumbsUp, ThumbsDown, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type FeedbackKind = 'complaint' | 'compliment';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tCode: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, tCode }) => {
  const [kind, setKind] = useState<FeedbackKind>('compliment');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');

  const reset = () => {
    setKind('compliment');
    setSubject('');
    setMessage('');
    setContactEmail('');
    setIsSubmitting(false);
    setSubmitError('');
    setSubmitSuccess(false);
    setEmailNotice('');
  };

  const handleClose = () => {
    onClose();
    // reset after closing so animation feels smooth
    setTimeout(reset, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    setEmailNotice('');

    const payload = {
      t_code: tCode,
      kind,
      subject: subject.trim() || null,
      message: message.trim(),
      contact_email: contactEmail.trim() || null,
    };

    const { data, error } = await supabase.from('feedback').insert(payload).select('id').single();

    if (error || !data) {
      setSubmitError('Não foi possível enviar agora. Tente novamente.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: fnError } = await supabase.functions.invoke('send-feedback-email', {
        body: { ...payload, id: data.id },
      });

      if (fnError) {
        setEmailNotice('Mensagem registrada. O envio de e-mail pode depender de configuração.');
      }
    } catch {
      setEmailNotice('Mensagem registrada. O envio de e-mail pode depender de configuração.');
    }

    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-premium-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground text-lg">Elogio ou Reclamação</h3>
                  <p className="text-sm text-muted-foreground">Sua mensagem será enviada ao time Prime.</p>
                </div>
                <button
                  onClick={handleClose}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setKind('compliment')}
                  className={`flex-1 px-4 py-2 rounded-xl border transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium ${
                    kind === 'compliment'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/60'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Elogio
                </button>
                <button
                  type="button"
                  onClick={() => setKind('complaint')}
                  className={`flex-1 px-4 py-2 rounded-xl border transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium ${
                    kind === 'complaint'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/60'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reclamação
                </button>
              </div>

              <input
                type="text"
                placeholder="Assunto (opcional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-premium"
              />

              <textarea
                placeholder="Escreva sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="input-premium resize-none"
                required
              />

              <input
                type="email"
                placeholder="Seu e-mail para retorno (opcional)"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="input-premium"
              />

              {submitError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="text-sm text-success bg-success/10 border border-success/20 rounded-lg p-3">
                  Feedback enviado com sucesso!
                </div>
              )}

              {emailNotice && (
                <div className="text-sm text-muted-foreground bg-muted/40 border border-border rounded-lg p-3">
                  {emailNotice}{' '}
                  <a
                    href={`mailto:fluig.prime@fluig.com?subject=${encodeURIComponent(
                      `[Portal Prime] ${kind === 'complaint' ? 'Reclamação' : 'Elogio'}${subject ? ` - ${subject}` : ''}`
                    )}&body=${encodeURIComponent(`Código: ${tCode}\n\n${message}`)}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar por e-mail
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium text-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
