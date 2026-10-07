import React, { useState } from 'react';
import { ProductListing, AegisAnalysisResult } from '../types/aegis';
import { DEMO_PRODUCTS, aegisDb } from '../services/db';

interface ComparePageProps {
  initialAnalysis?: AegisAnalysisResult | null;
  onViewReport: (result: AegisAnalysisResult) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ initialAnalysis, onViewReport }) => {
  const allProducts = DEMO_PRODUCTS;

  // Selected products to compare (indices)
  const [selectedIdxA, setSelectedIdxA] = useState<number>(0);
  const [selectedIdxB, setSelectedIdxB] = useState<number>(1);
  const [selectedIdxC, setSelectedIdxC] = useState<number>(3);

  // Compute or retrieve analyses
  const getAnalysis = (prod: ProductListing) => {
    return aegisDb.getLatestAnalysisForProduct(prod.id) || aegisDb.analyzeAndSave(prod, true);
  };

  const itemA = allProducts[selectedIdxA];
  const itemB = allProducts[selectedIdxB];
  const itemC = allProducts[selectedIdxC];

  const resA = getAnalysis(itemA);
  const resB = getAnalysis(itemB);
  const resC = getAnalysis(itemC);

  const comparedList = [
    { prod: itemA, res: resA, label: 'Listing A' },
    { prod: itemB, res: resB, label: 'Listing B' },
    { prod: itemC, res: resC, label: 'Listing C' },
  ];

  // Find lowest risk listing
  const lowestRisk = [...comparedList].sort((a, b) => a.res.overallScore - b.res.overallScore)[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
          MULTI-LISTING RISK TRIAGE
        </span>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
          Product Risk Comparison Matrix
        </h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-3xl">
          Evaluate multiple competing merchant listings side-by-side. AEGIS computes comparative signal differences across price stability, merchant tenure, and review authenticity to highlight the lower-risk option.
        </p>
      </div>

      {/* Comparative Recommendation Banner */}
      <div className="mb-8 rounded-2xl border border-[#D4AF37] bg-[#090909] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D4AF37]">
              <span className="h-2 w-2 rounded-full bg-[#8FD3FF] animate-pulse" />
              COMPARATIVE RISK SYNTHESIS
            </div>
            <h2 className="mt-1 font-mono text-lg font-bold text-white">
              Lowest Relative Risk Listing: {lowestRisk.label} ({lowestRisk.prod.title})
            </h2>
            <p className="mt-1 text-xs text-neutral-300 max-w-2xl font-mono">
              Score: {lowestRisk.res.overallScore}/100 ({lowestRisk.res.riskLevel} RISK) · {lowestRisk.prod.seller.name}
            </p>
          </div>

          <button
            onClick={() => onViewReport(lowestRisk.res)}
            className="rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 font-mono text-xs font-bold text-black uppercase hover:bg-[#FFE680] transition-colors"
          >
            Inspect Winner →
          </button>
        </div>
      </div>

      {/* 3-Column Comparative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparedList.map((col, colIdx) => (
          <div
            key={col.label}
            className={`rounded-2xl border p-6 flex flex-col justify-between font-mono text-xs transition-colors ${
              col.res.id === lowestRisk.res.id
                ? 'border-[#D4AF37] bg-[#090909]'
                : 'border-white/10 bg-[#090909]'
            }`}
          >
            <div>
              {/* Product Selector Dropdown */}
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <span className="font-bold text-white uppercase">{col.label}</span>
                <select
                  value={colIdx === 0 ? selectedIdxA : colIdx === 1 ? selectedIdxB : selectedIdxC}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (colIdx === 0) setSelectedIdxA(val);
                    if (colIdx === 1) setSelectedIdxB(val);
                    if (colIdx === 2) setSelectedIdxC(val);
                  }}
                  className="rounded border border-white/10 bg-[#111111] px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {allProducts.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      #{idx + 1}: {p.marketplace} - {p.title.substring(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Info */}
              <div className="mb-4">
                <div className="text-[11px] text-[#8FD3FF]">{col.prod.marketplace} · {col.prod.brand}</div>
                <h3 className="font-sans font-bold text-white text-sm line-clamp-2 mt-1">
                  {col.prod.title}
                </h3>
                <div className="mt-2 text-base font-extrabold text-white">
                  ₹{col.prod.currentPrice.toLocaleString()}{' '}
                  <span className="text-xs text-[#FFD54A] font-normal">(-{col.prod.discountPercent}%)</span>
                </div>
              </div>

              {/* Overall Risk Score Badge */}
              <div className="mb-4 rounded-xl border border-white/10 bg-[#111111] p-3 text-center">
                <div className="text-neutral-400 text-[10px]">AEGIS RISK SCORE</div>
                <div className="font-mono text-2xl font-black text-white mt-0.5">
                  {col.res.overallScore} <span className="text-xs text-neutral-400 font-normal">/ 100</span>
                </div>
                <div
                  className={`text-[11px] font-bold mt-1 ${
                    col.res.overallScore > 60
                      ? 'text-[#FFD54A]'
                      : col.res.overallScore > 35
                      ? 'text-[#FFE680]'
                      : 'text-[#8FD3FF]'
                  }`}
                >
                  {col.res.verdict}
                </div>
              </div>

              {/* Metric Breakdown Rows */}
              <div className="space-y-2.5 divide-y divide-white/5 text-neutral-300">
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Price Anomaly:</span>
                  <span className={col.res.priceIntel.isAnomaly ? 'text-[#FFD54A] font-bold' : 'text-white'}>
                    {col.res.priceIntel.isAnomaly ? 'ANOMALOUS' : 'NORMAL'}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Seller Rating:</span>
                  <span className="text-white">{col.prod.seller.rating} / 5.0</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Store Tenure:</span>
                  <span className="text-white">{col.prod.seller.tenureMonths} Months</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Fulfilment:</span>
                  <span className="text-white">
                    {col.prod.seller.isFulfilledByPlatform ? 'Marketplace' : '3rd Party Merchant'}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Duplicate Reviews:</span>
                  <span className="text-white">{col.res.reviewIntel.duplicatePhrasePercent}%</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Off-Platform Risk:</span>
                  <span className={col.res.scamLanguageIntel.offPlatformPaymentRisk ? 'text-[#FFD54A] font-bold' : 'text-[#8FD3FF]'}>
                    {col.res.scamLanguageIntel.offPlatformPaymentRisk ? 'DETECTED' : 'NONE'}
                  </span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-neutral-400">Return Policy:</span>
                  <span className="text-white text-right max-w-[150px] truncate">
                    {col.prod.returnPolicy || col.prod.seller.returnPolicy}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onViewReport(col.res)}
              className="mt-6 w-full rounded-xl border border-white/20 bg-[#111111] py-2 text-xs font-mono font-semibold text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              Full Inspection Report →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
