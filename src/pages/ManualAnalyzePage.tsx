import React, { useState } from 'react';
import { ProductListing, AegisAnalysisResult } from '../types/aegis';
import { DEMO_PRODUCTS, aegisDb } from '../services/db';
import { ScanProgressModal } from '../components/ScanProgressModal';
import { AegisShield3D } from '../components/AegisShield3D';

interface ManualAnalyzePageProps {
  onViewReport: (result: AegisAnalysisResult) => void;
}

export const ManualAnalyzePage: React.FC<ManualAnalyzePageProps> = ({ onViewReport }) => {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);
  const [productData, setProductData] = useState<ProductListing>(DEMO_PRODUCTS[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<AegisAnalysisResult | null>(null);

  const handleSelectDemo = (idx: number) => {
    setSelectedDemoIndex(idx);
    setProductData(DEMO_PRODUCTS[idx]);
    setLatestResult(null);
  };

  const handleStartScan = () => {
    setIsModalOpen(true);
  };

  const handleScanComplete = (result: AegisAnalysisResult) => {
    setIsModalOpen(false);
    aegisDb.analyzeAndSave(result.productSnapshot, true);
    setLatestResult(result);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#8FD3FF]">
          STANDALONE COMMERCE AUDITOR
        </span>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
          Manual Listing Risk Scanner
        </h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-3xl">
          Inspect any e-commerce product listing by choosing one of the exhibition test scenarios or entering custom listing parameters. The real AI, rule, and anomaly pipelines execute with zero simulation fallbacks.
        </p>
      </div>

      {/* Preset Scenario Selector */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#090909] p-5">
        <div className="text-xs font-mono uppercase text-[#D4AF37] mb-3">
          Select Exhibition Test Scenario:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_PRODUCTS.map((prod, idx) => (
            <button
              key={prod.id}
              onClick={() => handleSelectDemo(idx)}
              className={`rounded-xl border p-3.5 text-left font-mono text-xs transition-all ${
                selectedDemoIndex === idx
                  ? 'border-[#D4AF37] bg-[#111111] text-white'
                  : 'border-white/5 bg-[#050505] text-neutral-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[#8FD3FF]">#{idx + 1} {prod.marketplace}</span>
                <span className="text-[10px] text-neutral-500">{prod.category}</span>
              </div>
              <div className="truncate font-sans font-medium text-white">{prod.title}</div>
              <div className="mt-1 text-[11px] text-neutral-400">
                ₹{prod.currentPrice.toLocaleString()} (-{prod.discountPercent}%)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Editor / Inspection Form & Active Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Editable attributes */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#090909] p-6 space-y-4">
          <h2 className="font-mono text-base font-bold text-white flex items-center justify-between">
            <span>Listing Attributes to Audit</span>
            <span className="text-xs text-[#8FD3FF] font-normal">{productData.marketplace} Adapter Mode</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">Listing Title:</label>
              <input
                type="text"
                value={productData.title}
                onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white font-sans text-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Current Price (₹):</label>
                <input
                  type="number"
                  value={productData.currentPrice}
                  onChange={(e) => setProductData({ ...productData, currentPrice: Number(e.target.value) })}
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Original M.R.P. (₹):</label>
                <input
                  type="number"
                  value={productData.originalPrice}
                  onChange={(e) => setProductData({ ...productData, originalPrice: Number(e.target.value) })}
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Seller Name:</label>
                <input
                  type="text"
                  value={productData.seller.name}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      seller: { ...productData.seller, name: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Seller Rating (0-5):</label>
                <input
                  type="number"
                  step="0.1"
                  value={productData.seller.rating}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      seller: { ...productData.seller, rating: Number(e.target.value) },
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Product Description / Seller Notes:</label>
              <textarea
                rows={3}
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white font-sans text-xs focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Urgency / Off-Platform Messaging (if any):</label>
              <input
                type="text"
                value={productData.urgencyText || ''}
                onChange={(e) => setProductData({ ...productData, urgencyText: e.target.value })}
                placeholder="e.g. Only 1 left! Contact WhatsApp +91-..."
                className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleStartScan}
            className="w-full rounded-xl border border-[#D4AF37] bg-[#D4AF37] py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-[#FFE680] transition-colors shadow-lg"
          >
            EXECUTE AEGIS AUDIT ON LISTING →
          </button>
        </div>

        {/* Right Column: Live Results or 3D Shield Preview */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#090909] p-6">
          <div className="flex flex-col items-center">
            <h2 className="font-mono text-base font-bold text-white text-center mb-4">
              {latestResult ? 'Audit Analysis Complete' : 'Aegis Core Ready'}
            </h2>

            <AegisShield3D
              size="medium"
              score={latestResult ? latestResult.overallScore : 20}
              riskLevel={latestResult ? latestResult.riskLevel : 'LOW'}
            />

            {latestResult && (
              <div className="mt-4 w-full space-y-3 font-mono text-xs">
                <div className="rounded-xl border border-white/10 bg-[#111111] p-3 text-center">
                  <div className="text-neutral-400">VERDICT</div>
                  <div className="text-sm font-bold text-white mt-0.5">{latestResult.verdict}</div>
                  <div className="text-xs text-[#FFD54A] mt-1">
                    {latestResult.indicators.length} Risk Indicators Detected
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#050505] p-3 text-neutral-300 font-sans text-xs leading-relaxed">
                  {latestResult.summaryExplanation}
                </div>

                <button
                  onClick={() => onViewReport(latestResult)}
                  className="w-full rounded-xl border border-[#8FD3FF] bg-[#111111] py-2.5 font-mono text-xs font-bold text-[#8FD3FF] hover:bg-[#8FD3FF] hover:text-black transition-colors"
                >
                  OPEN DEEP 3D REPORT →
                </button>
              </div>
            )}

            {!latestResult && (
              <div className="mt-6 text-center text-xs text-neutral-500 font-mono">
                Click "EXECUTE AEGIS AUDIT" to trigger DOM token analysis, trigram review NLP, and price anomaly calculations.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      <ScanProgressModal
        product={productData}
        isOpen={isModalOpen}
        onComplete={handleScanComplete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};
