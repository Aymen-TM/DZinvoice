'use client';

import type { MenuItem } from '@/types/erp';

interface ERPNavbarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  menuItems: MenuItem[];
}

export default function ERPNavbar({ activeMenu, onMenuChange, menuItems }: ERPNavbarProps) {
  return (
    <nav className="w-full bg-[var(--card)] shadow z-30 flex flex-col sm:flex-row items-center h-auto sm:h-16 px-2 sm:px-8 border-b border-[var(--border)] sticky top-0">
      <div className="flex flex-wrap gap-2 sm:gap-6 w-full justify-center sm:justify-start py-2 sm:py-0">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
              activeMenu === item.key 
                ? "bg-[var(--primary)] text-white shadow" 
                : "text-[var(--primary-dark)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
            }`}
            onClick={() => onMenuChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
} 