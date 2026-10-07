import React from 'react';
import { AegisShield3D } from '../components/AegisShield3D';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#111111] px-4 py-1.5 text-xs font-mono text-[#D4AF37]">
                <span className="h-2 w-2 rounded-full bg-[#8FD3FF] animate-pulse" />
                AI SECURITY LAYER FOR DIGITAL COMMERCE
              </div>

              <h1 className="font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
                See the threat.<br />
                Understand the risk.<br />
                <span className="text-[#D4AF37]">Shop with confidence.</span>
              </h1>

              <p className="max-w-2xl text-base text-neutral-300 leading-relaxed sm:text-lg">
                AEGIS is an autonomous consumer cyber-defense platform operating on Amazon, Flipkart, and digital marketplaces. It detects price manipulation, review syndicates, suspicious merchants, and off-platform payment lures using a hybrid AI and risk engine with real-time 3D spatial threat telemetry.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('extension-sim')}
                  className="rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-[#FFE680] transition-colors shadow-lg"
                >
                  TEST BROWSER EXTENSION →
                </button>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="rounded-xl border border-white/20 bg-[#111111] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:border-[#8FD3FF] hover:text-[#8FD3FF] transition-colors"
                >
                  MANUAL SCANNER
                </button>
                <button
                  onClick={() => onNavigate('admin')}
                  className="rounded-xl border border-white/10 bg-[#090909] px-4 py-3.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Judges Demo Hub
                </button>
              </div>

              {/* Security Policy Assurance */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-mono">
                <span>✓ Explicit User Consent Only</span>
                <span>✓ Zero Private Credential Access</span>
                <span>✓ Client-Side Permitted APIs</span>
              </div>
            </div>

            {/* Right: Live Interactive 3D Shield Core */}
            <div className="flex flex-col items-center justify-center lg:col-span-5">
              <div className="relative">
                <AegisShield3D
                  size="large"
                  score={24}
                  riskLevel="LOW"
                  showControls={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Detection Modules Section */}
      <section className="border-t border-white/10 bg-[#090909] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8FD3FF]">
              INDEPENDENT DETECTION ENGINES
            </span>
            <h2 className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Six-Layer Multimodal Fraud Assessment
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Every analyzed product listing passes through independent, explainable AI classifiers that generate statistical evidence rather than opaque verdicts.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Price Anomaly */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-3 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#050505] text-[#D4AF37] font-mono font-bold text-sm">
                01
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Price Anomaly Detection</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Flags unnatural markdown patterns (&gt;75% discounts) and compares current rates against observed category market baselines to detect counterfeit liquidations.
              </p>
            </div>

            {/* 2. Seller Risk Analysis */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-3 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#050505] text-[#D4AF37] font-mono font-bold text-sm">
                02
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Seller Risk Analysis</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Audits merchant registration tenure, rating distribution, platform fulfillment, and non-returnable policies to isolate throwaway storefronts.
              </p>
            </div>

            {/* 3. Review Intelligence */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-3 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#050505] text-[#D4AF37] font-mono font-bold text-sm">
                03
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Review Intelligence</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Computes pairwise trigram similarity and sentiment-rating dissonance to detect coordinated fake review rings with exact statistical percentages.
              </p>
            </div>

            {/* 4. Product Description Analysis */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-3 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#050505] text-[#D4AF37] font-mono font-bold text-sm">
                04
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Description Analysis</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                NLP identifies high-pressure scarcity tactics, contradictory technical specs between title and details, and unverified medical/financial claims.
              </p>
            </div>

            {/* 5. Counterfeit / Authenticity */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-3 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#050505] text-[#D4AF37] font-mono font-bold text-sm">
                05
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Authenticity Risk</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Identifies brand typosquatting ("App1e", "Samsvng") and flags unauthorized third-party distribution of high-value trademarked electronics.
              </p>
            </div>

            {/* 6. Scam Language & Off-Platform */}
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-3 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#050505] text-[#D4AF37] font-mono font-bold text-sm">
                06
              </div>
              <h3 className="font-mono text-lg font-semibold text-white">Scam Language Intercept</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Instantly escalates listings containing WhatsApp diversions, direct UPI solicitations, external refund forms, and credential harvesting attempts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Pipeline Section */}
      <section className="py-20 bg-[#050505] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
              TRANSPARENT SYSTEM DESIGN
            </span>
            <h2 className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From Visible Page to 3D Decision Support
            </h2>
            <p className="text-sm text-neutral-400">
              AEGIS enforces strict ethical boundaries: zero scraping of private endpoints and zero silent execution.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs text-center">
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="text-neutral-500 mb-1">01</div>
              <div className="font-semibold text-white">Site Adapter</div>
              <div className="text-[10px] text-neutral-400 mt-1">Amazon / Flipkart</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="text-neutral-500 mb-1">02</div>
              <div className="font-semibold text-white">User Consent</div>
              <div className="text-[10px] text-neutral-400 mt-1">Explicit Opt-In</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="text-neutral-500 mb-1">03</div>
              <div className="font-semibold text-white">Feature Vectors</div>
              <div className="text-[10px] text-neutral-400 mt-1">TF-IDF & Baselines</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="text-neutral-500 mb-1">04</div>
              <div className="font-semibold text-white">Rules Engine</div>
              <div className="text-[10px] text-neutral-400 mt-1">Heuristics & Traps</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="text-neutral-500 mb-1">05</div>
              <div className="font-semibold text-white">Risk Engine</div>
              <div className="text-[10px] text-neutral-400 mt-1">0 - 100 Multi-Score</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
              <div className="text-neutral-500 mb-1">06</div>
              <div className="font-semibold text-white">Explainability</div>
              <div className="text-[10px] text-neutral-400 mt-1">Verified Evidence</div>
            </div>
            <div className="rounded-xl border border-[#D4AF37]/50 bg-[#111111] p-4">
              <div className="text-[#D4AF37] mb-1">07</div>
              <div className="font-semibold text-white">3D In-Page HUD</div>
              <div className="text-[10px] text-[#8FD3FF] mt-1">Real-time Overlay</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#090909] py-8 text-center text-xs font-mono text-neutral-400">
        <p>AEGIS Digital Commerce Cyber-Security Platform · Academic & University Demonstration Edition</p>
      </footer>
    </div>
  );
};
