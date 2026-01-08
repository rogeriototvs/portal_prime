/**
 * Link Card Component
 * Premium styled card for quick access links
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, LucideIcon } from 'lucide-react';

interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  delay?: number;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  title,
  description,
  href,
  icon: Icon,
  delay = 0,
}) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="link-card group"
    >
      <div className="link-icon">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
    </motion.a>
  );
};
