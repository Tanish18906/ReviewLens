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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface border border-border rounded-card shadow-subtle">
      <div className="w-13 h-13 rounded-full bg-brand-subtle flex items-center justify-center text-brand mb-4 border border-brand/10">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[18px] font-bold text-ink mb-1.5">{title}</h3>
      <p className="text-[14px] text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4.5 py-2 text-[13px] font-semibold text-brand bg-brand-subtle hover:bg-brand hover:text-white rounded-control border border-brand/20 transition-all shadow-2xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
