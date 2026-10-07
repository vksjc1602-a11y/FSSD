import React, { useState, useEffect } from 'react';
import { aegisDb } from '../services/db';

interface NavigationProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenQuickScan?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onNavigate }) => {
  const [unreadAlerts, setUnreadAlerts] = useState<number>(() => aegisDb.getUnreadNotificationsCount());

  useEffect(() => {
    const unsub = aegisDb.subscribeToNotifications(() => {
      setUnreadAlerts(aegisDb.getUnreadNotificationsCount());
    });
    return unsub;
  }, []);

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'extension-sim', label: 'Live Extension' },
    { id: 'scanner', label: 'Scan Listing' },
    { id: 'dashboard', label: 'My Aegis', hasBadge: unreadAlerts > 0 },
    { id: 'compare', label: 'Compare' },
    { id: 'insights', label: 'AI Metrics' },
    { id: 'pricing', label: 'Pro Tier' },
    { id: 'admin', label: 'Exhibition Demo' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#111111]">
            <svg
              className="h-4 w-4 text-[#D4AF37]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="font-mono text-xl font-bold tracking-tight text-white hover:text-[#D4AF37] transition-colors">
            AEGIS
          </span>
        </button>

        {/* Zone 2: Clean unboxed text navigation links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'font-semibold text-[#8FD3FF] border-b-2 border-[#8FD3FF] pb-1'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {link.hasBadge && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFD54A] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Real-time Threat Alerts Bell */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-[#111111] text-neutral-300 hover:text-white hover:border-[#D4AF37] transition-colors"
            title={`${unreadAlerts} unread threat alerts`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-mono font-bold text-black animate-pulse">
                {unreadAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('extension-sim')}
            className="flex items-center gap-2 rounded-lg border border-[#8FD3FF]/30 bg-[#111111] px-3.5 py-1.5 text-xs font-medium text-[#8FD3FF] hover:border-[#8FD3FF] hover:text-white transition-all whitespace-nowrap"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#8FD3FF] animate-pulse" />
            Browser Extension
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className="hidden sm:inline-flex items-center rounded-lg border border-[#D4AF37] bg-[#D4AF37] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#FFE680] transition-colors whitespace-nowrap"
          >
            Judges Demo
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex lg:hidden overflow-x-auto border-t border-white/5 px-4 py-2 gap-4 text-xs scrollbar-none">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`whitespace-nowrap py-1 flex items-center gap-1 ${
              currentTab === link.id ? 'font-semibold text-[#8FD3FF]' : 'text-neutral-400'
            }`}
          >
            <span>{link.label}</span>
            {link.hasBadge && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD54A]" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
};
