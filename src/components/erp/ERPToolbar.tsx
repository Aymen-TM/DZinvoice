'use client';

import type { ToolbarButton } from '@/types/erp';

interface ERPToolbarProps {
  toolbarButtons: ToolbarButton[];
}

export default function ERPToolbar({ toolbarButtons }: ERPToolbarProps) {
  return (
    <div className="bg-[var(--card)] border-b border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center px-2 sm:px-8 h-auto sm:h-14 z-30 sticky top-16">
      <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-start py-2 sm:py-0">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.key}
            className="px-4 py-2 bg-[var(--primary)]/5 border border-[var(--border)] rounded-xl text-[var(--primary-dark)] font-medium text-sm hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 transition-colors"
            {...(typeof btn.onClick === 'function' ? { onClick: btn.onClick } : {})}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
} 