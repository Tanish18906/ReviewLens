import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface border border-border rounded-card">
      <div className="w-12 h-12 rounded-full bg-page flex items-center justify-center text-muted mb-4 border border-border">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[17px] font-bold text-ink mb-1">{title}</h3>
      <p className="text-[14px] text-muted max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-[13px] font-semibold text-brand hover:bg-page rounded-control border border-border transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
