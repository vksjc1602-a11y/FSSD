import React, { useState } from 'react';
import { AegisAnalysisResult } from '../types/aegis';
import { AegisShield3D } from '../components/AegisShield3D';
import { aegisDb } from '../services/db';

interface ProductReportPageProps {
  analysis: AegisAnalysisResult;
  onBack: () => void;
  onCompareWithOthers: (analysis: AegisAnalysisResult) => void;
}

export const ProductReportPage: React.FC<ProductReportPageProps> = ({
  analysis,
  onBack,
  onCompareWithOthers,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INTELLIGENCE' | 'EVIDENCE' | 'SPECIFICATIONS'>('OVERVIEW');
  const prod = analysis.productSnapshot;
  const [isTracked, setIsTracked] = useState<boolean>(() => aegisDb.isProductTracked(prod.id));

  const handleToggleTracking = () => {
    if (isTracked) {
      aegisDb.untrackProduct(prod.id);
      setIsTracked(false);
    } else {
      aegisDb.trackProduct(prod);
      setIsTracked(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-white/10 bg-[#111111] px-3 py-1.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#8FD3FF]">
              REPORT ID: {analysis.id}
            </span>
            <h1 className="font-mono text-xl sm:text-2xl font-bold text-white truncate max-w-xl">
              {prod.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={handleToggleTracking}
            className={`rounded-lg border px-3.5 py-2 font-mono text-xs transition-colors flex items-center gap-2 ${
              isTracked
                ? 'border-[#8FD3FF] bg-[#111111] text-[#8FD3FF] font-semibold'
                : 'border-white/10 bg-[#111111] text-neutral-400 hover:text-white hover:border-white/30'
            }`}
          >
            <span className={isTracked ? 'text-[#8FD3FF]' : 'text-neutral-500'}>◉</span>
            <span>{isTracked ? 'Monitoring Active' : '+ Track Product'}</span>
          </button>
          <button
            onClick={() => onCompareWithOthers(analysis)}
            className="rounded-lg border border-[#D4AF37]/50 bg-[#111111] px-4 py-2 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
          >
            Compare Listing ⇄
          </button>
        </div>
      </div>

      {/* Main 3D Hero Command Center Grid */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl border border-white/10 bg-[#090909] p-6 lg:p-8">
        {/* Left Column: 3D Aegis Core */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
          <AegisShield3D
            size="large"
            score={analysis.overallScore}
            riskLevel={analysis.riskLevel}
            showControls={true}
          />
        </div>

        {/* Right Column: Key Verdict, Scores & Recommendation */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
              <span>ANALYZED LISTING TARGET</span>
              <span className="text-[#8FD3FF] font-semibold">{prod.marketplace} Adaptor</span>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-[#111111] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                    AEGIS DECISION SUPPORT VERDICT
                  </span>
                  <div className="font-mono text-2xl font-extrabold text-white mt-0.5">
                    {analysis.verdict}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-3xl font-extrabold text-[#FFD54A] tabular-nums">
                    {analysis.overallScore} <span className="text-base text-neutral-400 font-normal">/ 100</span>
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    Risk Level: <span className="font-semibold text-white">{analysis.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Confidence & Disclaimers */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Statistical Model Confidence: {Math.round(analysis.confidence * 100)}%</span>
                <span>{analysis.indicators.length} Signals Flagged</span>
              </div>
            </div>

            {/* Explanation Quote */}
            <div className="mt-4 rounded-xl border border-white/5 bg-[#050505] p-4 text-xs text-neutral-300 leading-relaxed font-mono">
              <span className="text-[#D4AF37] font-semibold">SYNTHESIZED EXPLANATION:</span>{' '}
              {analysis.summaryExplanation}
            </div>

            {/* Recommended Action */}
            <div className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 text-xs text-neutral-200 leading-relaxed font-mono">
              <span className="text-[#FFE680] font-semibold">ACTIONABLE RECOMMENDATION:</span>{' '}
              {analysis.recommendedAction}
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono">
            *Notice: AEGIS provides probabilistic risk analysis derived from user-visible page data. It does not provide absolute legal or commercial warranties.
          </div>
        </div>
      </div>

      {/* Navigation tabs for deep report */}
      <div className="mb-6 flex gap-4 border-b border-white/10 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-2 ${
            activeTab === 'OVERVIEW'
              ? 'border-b-2 border-[#8FD3FF] font-bold text-[#8FD3FF]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          01. INTELLIGENCE MATRIX
        </button>
        <button
          onClick={() => setActiveTab('EVIDENCE')}
          className={`pb-2 ${
            activeTab === 'EVIDENCE'
              ? 'border-b-2 border-[#8FD3FF] font-bold text-[#8FD3FF]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          02. DETECTED EVIDENCE ({analysis.indicators.length})
        </button>
        <button
          onClick={() => setActiveTab('SPECIFICATIONS')}
          className={`pb-2 ${
            activeTab === 'SPECIFICATIONS'
              ? 'border-b-2 border-[#8FD3FF] font-bold text-[#8FD3FF]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          03. EXTRACTED LISTING ATTRIBUTES
        </button>
      </div>

      {/* Tab 1: Intelligence Matrix */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Price Intelligence Card */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">PRICE INTELLIGENCE</span>
              <span className="tabular-nums font-semibold text-[#8FD3FF]">
                {analysis.priceIntel.score}/100
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Discount Offered:</span>
                <span className="text-white font-bold">{analysis.priceIntel.discountPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Baseline Market Average:</span>
                <span>₹{analysis.priceIntel.observedBaselinePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Statistical Anomaly:</span>
                <span className={analysis.priceIntel.isAnomaly ? 'text-[#FFD54A] font-bold' : 'text-[#8FD3FF]'}>
                  {analysis.priceIntel.isAnomaly ? 'ANOMALOUS' : 'NORMAL'}
                </span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 text-[11px] text-neutral-400 font-sans">
              {analysis.priceIntel.findings[0]}
            </div>
          </div>

          {/* Seller Intelligence Card */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">SELLER INTELLIGENCE</span>
              <span className="tabular-nums font-semibold text-[#8FD3FF]">
                {analysis.sellerIntel.score}/100
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Seller Public Rating:</span>
                <span className="text-white">{analysis.sellerIntel.sellerRating} / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Storefront Tenure:</span>
                <span>{analysis.sellerIntel.tenureMonths} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Return Policy Risk:</span>
                <span className={analysis.sellerIntel.returnPolicyRisk === 'HIGH' ? 'text-[#FFD54A]' : 'text-white'}>
                  {analysis.sellerIntel.returnPolicyRisk}
                </span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 text-[11px] text-neutral-400 font-sans">
              {analysis.sellerIntel.findings[0]}
            </div>
          </div>

          {/* Review Intelligence Card */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">REVIEW INTELLIGENCE</span>
              <span className="tabular-nums font-semibold text-[#8FD3FF]">
                {analysis.reviewIntel.score}/100
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Sampled Reviews:</span>
                <span className="text-white">{analysis.reviewIntel.sampledCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Duplicate Phrasing:</span>
                <span className={analysis.reviewIntel.duplicatePhrasePercent > 20 ? 'text-[#FFD54A] font-bold' : 'text-white'}>
                  {analysis.reviewIntel.duplicatePhrasePercent}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Sentiment Dissonance:</span>
                <span>{analysis.reviewIntel.sentimentDissonanceCount} review(s)</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 text-[11px] text-neutral-400 font-sans">
              {analysis.reviewIntel.findings[0]}
            </div>
          </div>

          {/* Description Intelligence Card */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">DESCRIPTION ANALYSIS</span>
              <span className="tabular-nums font-semibold text-[#8FD3FF]">
                {analysis.descriptionIntel.score}/100
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Urgency Level:</span>
                <span className="text-white">{analysis.descriptionIntel.urgencyLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Unrealistic Guarantees:</span>
                <span>{analysis.descriptionIntel.unrealisticGuaranteesDetected ? 'DETECTED' : 'NONE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Spec Contradictions:</span>
                <span>{analysis.descriptionIntel.specContradictionsFound.length}</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 text-[11px] text-neutral-400 font-sans">
              {analysis.descriptionIntel.findings[0]}
            </div>
          </div>

          {/* Authenticity Intelligence Card */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">AUTHENTICITY RISK</span>
              <span className="tabular-nums font-semibold text-[#8FD3FF]">
                {analysis.authenticityIntel.score}/100
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Brand Typosquatting:</span>
                <span className={analysis.authenticityIntel.brandMismatchRisk === 'HIGH' ? 'text-[#FFD54A] font-bold' : 'text-white'}>
                  {analysis.authenticityIntel.brandMismatchRisk}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Seller Authorization:</span>
                <span>{analysis.authenticityIntel.sellerAuthorizationStatus}</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 text-[11px] text-neutral-400 font-sans">
              {analysis.authenticityIntel.findings[0]}
            </div>
          </div>

          {/* Scam Language Card */}
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white">SCAM LANGUAGE ENGINE</span>
              <span className="tabular-nums font-semibold text-[#8FD3FF]">
                {analysis.scamLanguageIntel.score}/100
              </span>
            </div>
            <div className="space-y-1.5 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Off-Platform Payment Risk:</span>
                <span className={analysis.scamLanguageIntel.offPlatformPaymentRisk ? 'text-[#FFD54A] font-bold' : 'text-[#8FD3FF]'}>
                  {analysis.scamLanguageIntel.offPlatformPaymentRisk ? 'CRITICAL RISK' : 'CLEAN'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Trigger Keywords:</span>
                <span>{analysis.scamLanguageIntel.detectedKeywords.length} Pattern(s)</span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-2 text-[11px] text-neutral-400 font-sans">
              {analysis.scamLanguageIntel.findings[0]}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Detected Evidence */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-4">
          {analysis.indicators.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#090909] p-8 text-center text-xs font-mono text-neutral-400">
              No elevated risk indicators detected on this product page.
            </div>
          ) : (
            analysis.indicators.map((ind) => (
              <div
                key={ind.id}
                className="rounded-2xl border border-white/10 bg-[#090909] p-5 font-mono text-xs space-y-2 hover:border-[#D4AF37]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{ind.title}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-[#8FD3FF]">{ind.category}</span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] uppercase font-bold ${
                      ind.severity === 'CRITICAL' || ind.severity === 'HIGH'
                        ? 'bg-[#FFD54A]/20 text-[#FFD54A]'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {ind.severity}
                  </span>
                </div>
                <p className="text-neutral-300 font-sans text-xs leading-relaxed">{ind.description}</p>
                <div className="rounded-lg border border-white/5 bg-[#111111] p-3 text-neutral-400">
                  <span className="text-white font-semibold">Evidence Extracted:</span> {ind.evidence}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Extracted Listing Specifications */}
      {activeTab === 'SPECIFICATIONS' && (
        <div className="rounded-2xl border border-white/10 bg-[#090909] p-6 font-mono text-xs space-y-4">
          <h3 className="font-bold text-white text-sm">Visible Hardware & Listing Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(prod.specifications || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-neutral-400">{key}:</span>
                <span className="text-white font-semibold">{val}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Original URL:</span>
              <span className="text-[#8FD3FF] truncate max-w-md">{prod.url}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Delivery Claim:</span>
              <span className="text-white">{prod.deliveryClaim || 'Standard delivery terms'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Return Policy:</span>
              <span className="text-white">{prod.returnPolicy || 'Marketplace default'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
