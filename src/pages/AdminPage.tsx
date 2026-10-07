import React, { useState } from 'react';
import { aegisDb, DEMO_PRODUCTS } from '../services/db';
import { AegisAnalysisResult } from '../types/aegis';

interface AdminPageProps {
  onLaunchScenario: (result: AegisAnalysisResult) => void;
  onNavigate: (tab: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLaunchScenario, onNavigate }) => {
  const [dbState, setDbState] = useState({
    productsCount: aegisDb.getAllProducts().length,
    analysesCount: aegisDb.getAllAnalyses().length,
  });
  const [notification, setNotification] = useState<string | null>(null);

  const handlePreloadAll = () => {
    aegisDb.preloadDemoData();
    setDbState({
      productsCount: aegisDb.getAllProducts().length,
      analysesCount: aegisDb.getAllAnalyses().length,
    });
    setNotification('Preloaded all 6 synthetic exhibition demo listings with fresh risk computations.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleResetDb = () => {
    aegisDb.resetDemoData();
    setDbState({
      productsCount: aegisDb.getAllProducts().length,
      analysesCount: aegisDb.getAllAnalyses().length,
    });
    setNotification('Database reset to baseline state.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLaunchProduct = (productId: string) => {
    const analysis = aegisDb.getLatestAnalysisForProduct(productId);
    if (analysis) {
      onLaunchScenario(analysis);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
          EXHIBITION & JUDGING CONTROL CENTER
        </span>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
          University Demonstration Console
        </h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-3xl">
          Quickly showcase all core threat vectors to competition judges in under 3 minutes. Each scenario runs the actual mathematical NLP and risk calculation pipeline.
        </p>
      </div>

      {notification && (
        <div className="mb-6 rounded-xl border border-[#8FD3FF] bg-[#111111] p-3 font-mono text-xs text-[#8FD3FF]">
          ✓ {notification}
        </div>
      )}

      {/* System Telemetry & Health Panel */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-neutral-400">SYSTEM HEALTH</span>
          <div className="mt-2 text-xl font-bold text-[#8FD3FF] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#8FD3FF] animate-pulse" />
            OPERATIONAL
          </div>
          <span className="mt-1 block text-neutral-500">Latency: 14ms (Local Engine)</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-neutral-400">AI / ML PIPELINE</span>
          <div className="mt-2 text-xl font-bold text-white">ACTIVE ENSEMBLE</div>
          <span className="mt-1 block text-neutral-500">TF-IDF + Linear SVM + Trigrams</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-neutral-400">DATABASE STATUS</span>
          <div className="mt-2 text-xl font-bold text-white">
            {dbState.analysesCount} Analyses Stored
          </div>
          <span className="mt-1 block text-neutral-500">In-Memory + REST Endpoints</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-neutral-400">SUPPORTED PLATFORMS</span>
          <div className="mt-2 text-xl font-bold text-[#D4AF37]">3 Adapters Ready</div>
          <span className="mt-1 block text-neutral-500">Amazon, Flipkart, Generic</span>
        </div>
      </div>

      {/* Database Controls Toolbar */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#090909] p-5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="text-white font-bold">EXHIBITION DATA STATE</span>
          <p className="text-neutral-400 text-[11px] mt-0.5">
            Reset or reload synthetic test cases for demonstrations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePreloadAll}
            className="rounded-lg border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 font-bold text-black hover:bg-[#FFE680] transition-colors"
          >
            Preload All 6 Scenarios
          </button>
          <button
            onClick={handleResetDb}
            className="rounded-lg border border-white/20 bg-[#111111] px-4 py-2 text-white hover:border-white transition-colors"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* 6 Exhibition Demonstration Scenarios */}
      <div className="rounded-2xl border border-white/10 bg-[#090909] p-6 font-mono text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Judges' 3-Minute Showcase Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_PRODUCTS.map((prod, idx) => {
            const analysis = aegisDb.getLatestAnalysisForProduct(prod.id);
            const score = analysis?.overallScore ?? 50;
            const level = analysis?.riskLevel ?? 'MODERATE';

            return (
              <div
                key={prod.id}
                className="rounded-xl border border-white/10 bg-[#111111] p-4 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8FD3FF] font-bold">Scenario #{idx + 1}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        level === 'CRITICAL' || level === 'HIGH'
                          ? 'bg-[#FFD54A]/20 text-[#FFD54A]'
                          : level === 'ELEVATED'
                          ? 'bg-[#FFE680]/20 text-[#FFE680]'
                          : 'bg-[#8FD3FF]/20 text-[#8FD3FF]'
                      }`}
                    >
                      {score}/100 {level}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-white text-xs line-clamp-2">
                    {prod.title}
                  </h3>

                  <div className="mt-2 text-neutral-400 text-[11px] space-y-1">
                    <div>Marketplace: <span className="text-white">{prod.marketplace}</span></div>
                    <div>Price: <span className="text-white">₹{prod.currentPrice.toLocaleString()} (-{prod.discountPercent}%)</span></div>
                    <div>Seller: <span className="text-white">{prod.seller.name}</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => handleLaunchProduct(prod.id)}
                    className="flex-1 rounded-lg border border-[#D4AF37]/50 bg-[#050505] py-2 text-center text-[#D4AF37] font-bold hover:bg-[#D4AF37] hover:text-black transition-colors"
                  >
                    Launch 3D Report →
                  </button>
                  <button
                    onClick={() => onNavigate('extension-sim')}
                    className="rounded-lg border border-white/10 bg-[#050505] px-2.5 py-2 text-neutral-400 hover:text-white transition-colors"
                    title="Test in extension simulation"
                  >
                    Extension
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
