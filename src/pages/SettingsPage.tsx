import React, { useState } from 'react';
import { SitePermission } from '../types/aegis';
import { aegisDb } from '../services/db';

export const SettingsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<SitePermission[]>(aegisDb.getPermissions());
  const [message, setMessage] = useState<string | null>(null);

  const handleToggleAutoScan = (domain: string) => {
    const list = permissions.map((p) => {
      if (p.domain === domain) {
        const updated = { ...p, autoScanEnabled: !p.autoScanEnabled };
        aegisDb.setPermission(updated);
        return updated;
      }
      return p;
    });
    setPermissions(list);
    setMessage(`Updated auto-scan preference for ${domain}.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRevokePermission = (domain: string) => {
    aegisDb.deletePermission(domain);
    setPermissions(aegisDb.getPermissions());
    setMessage(`Permission revoked for ${domain}.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddSite = () => {
    const site = prompt('Enter e-commerce domain to authorize (e.g. myntra.com):');
    if (site) {
      const clean = site.toLowerCase().replace(/https?:\/\//, '').replace(/\/.*$/, '').trim();
      const newPerm: SitePermission = {
        id: `perm-${Date.now()}`,
        domain: clean,
        grantedAt: new Date().toISOString(),
        status: 'ACTIVE',
        autoScanEnabled: true,
        scannedCount: 0,
      };
      aegisDb.setPermission(newPerm);
      setPermissions(aegisDb.getPermissions());
      setMessage(`Authorized ${clean} for visible DOM scanning.`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClearData = () => {
    if (confirm('Delete all cached product scan snapshots and analysis history?')) {
      aegisDb.clearAllHistory();
      setMessage('All local and server-side analysis records deleted.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
          USER CONTROL & PRIVACY CENTER
        </span>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
          Settings & Site Permissions
        </h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-3xl">
          AEGIS never analyzes web pages without explicit consent. Manage per-site execution privileges, automatic background scanning, and persistent data retention.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-[#8FD3FF] bg-[#111111] p-3 font-mono text-xs text-[#8FD3FF]">
          ✓ {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Authorized Domains */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#090909] p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Authorized Marketplace Sites
              </h2>
              <p className="text-neutral-400 mt-0.5">
                Domains granted explicit permission to execute client-side site adapters
              </p>
            </div>
            <button
              onClick={handleAddSite}
              className="rounded-lg border border-[#D4AF37]/50 bg-[#111111] px-3 py-1.5 text-xs text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              + Add Domain
            </button>
          </div>

          <div className="space-y-3">
            {permissions.length === 0 ? (
              <div className="py-6 text-center text-neutral-500">
                No active site permissions.
              </div>
            ) : (
              permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="rounded-xl border border-white/5 bg-[#111111] p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-bold text-white text-sm">{perm.domain}</div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      Granted: {perm.grantedAt.substring(0, 10)} · {perm.scannedCount} Scans Performed
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleAutoScan(perm.domain)}
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        perm.autoScanEnabled
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      Auto-Scan: {perm.autoScanEnabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => handleRevokePermission(perm.domain)}
                      className="rounded border border-white/10 bg-[#050505] px-3 py-1 text-neutral-400 hover:text-white hover:border-white transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Data Privacy & Hardening */}
        <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#090909] p-6 space-y-6 font-mono text-xs">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Privacy Architecture Guarantees
            </h2>
            <div className="space-y-2 text-neutral-400 leading-relaxed font-sans text-xs">
              <p>• Zero scraping of private or authenticated API endpoints.</p>
              <p>• Zero access to payment cards, OTP tokens, or user accounts.</p>
              <p>• All analyses operate strictly on public DOM listing information.</p>
              <p>• Data is isolated to anonymized threat signatures.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Data Retention Controls
            </h3>
            <button
              onClick={handleClearData}
              className="w-full rounded-xl border border-white/20 bg-[#111111] py-2.5 font-bold text-white hover:border-[#FFD54A] hover:text-[#FFD54A] transition-colors"
            >
              Clear All Stored Analyses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
