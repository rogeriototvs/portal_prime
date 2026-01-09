/**
 * Feedback Page
 * Dedicated page for clients to send compliments/complaints
 */
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Header } from '@/components/portal/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type FeedbackKind = 'complaint' | 'compliment';

const Feedback: React.FC = () => {
  const { isClientAuthenticated, clientTCode } = useAuth();
  const navigate = useNavigate();

  const [kind, setKind] = useState<FeedbackKind>('compliment');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');

  if (!isClientAuthenticated) return <Navigate to="/" replace />;
  if (!clientTCode) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    setEmailNotice('');

    const payload = {
      t_code: clientTCode,
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Feedback</h1>
            <p className="text-sm text-muted-foreground">Envie um elogio ou uma reclamação para o time Prime</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  rows={7}
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
                      )}&body=${encodeURIComponent(`Código: ${clientTCode}\n\n${message}`)}`}
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
                    onClick={() => navigate('/portal')}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-premium text-sm">
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="premium-card">
              <h2 className="font-display font-semibold text-foreground mb-2">Identificação</h2>
              <p className="text-sm text-muted-foreground">
                Código do cliente: <span className="font-semibold text-foreground">{clientTCode}</span>
              </p>
            </div>

            <div className="premium-card">
              <h2 className="font-display font-semibold text-foreground mb-2">Dica</h2>
              <p className="text-sm text-muted-foreground">
                Se desejar retorno, informe seu e-mail no formulário.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Feedback;
