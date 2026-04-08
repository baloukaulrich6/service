import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl ${padding ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  );
}
