import React, { useState } from 'react';
import { ProductListing, AegisAnalysisResult } from '../types/aegis';
import { DEMO_PRODUCTS, aegisDb } from '../services/db';
import { runAegisRiskPipeline } from '../services/riskEngine';
import { AegisShield3D } from './AegisShield3D';

interface ExtensionSimulatorProps {
  onViewFullReport: (analysis: AegisAnalysisResult) => void;
}

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({ onViewFullReport }) => {
  // Store navigation simulation
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const currentProduct = DEMO_PRODUCTS[selectedProductIndex];

  // Extension states
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(true);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<AegisAnalysisResult | null>(null);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState<boolean>(true);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(true);
  const [showExtensionPopup, setShowExtensionPopup] = useState<boolean>(false);

  // Trigger scan
  const handlePerformScan = (product: ProductListing) => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate DOM extraction and backend response
    setTimeout(() => {
      const result = aegisDb.analyzeAndSave(product, true);
      setScanResult(result);
      setIsScanning(false);
    }, 1100);
  };

  const handleAllowPermission = (allSites: boolean = false) => {
    setPermissionGranted(true);
    setShowPermissionPrompt(false);
    if (autoScanEnabled) {
      handlePerformScan(currentProduct);
    }
    if (allSites) {
      aegisDb.setPermission({
        id: `perm-all-${Date.now()}`,
        domain: '*.ecommerce-supported',
        grantedAt: new Date().toISOString(),
        status: 'ACTIVE',
        autoScanEnabled: true,
        scannedCount: 1,
      });
    }
  };

  const handleProductSwitch = (index: number) => {
    setSelectedProductIndex(index);
    const newProd = DEMO_PRODUCTS[index];
    if (permissionGranted && autoScanEnabled) {
      handlePerformScan(newProd);
    } else {
      setScanResult(null);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Simulation Control Bar */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#090909] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-mono text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8FD3FF] animate-pulse" />
              IN-PAGE BROWSER EXTENSION RUNTIME
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulating Chromium Manifest V3 Content Script & Site Adapter directly on active e-commerce DOM
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Store switcher */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111111] p-1">
              {DEMO_PRODUCTS.map((prod, idx) => (
                <button
                  key={prod.id}
                  onClick={() => handleProductSwitch(idx)}
                  className={`rounded px-2.5 py-1 text-xs font-mono transition-colors ${
                    selectedProductIndex === idx
                      ? 'bg-[#D4AF37] text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={prod.title}
                >
                  Scenario {idx + 1}: {prod.marketplace}
                </button>
              ))}
            </div>

            {/* Extension Toolbar Icon */}
            <button
              onClick={() => setShowExtensionPopup(!showExtensionPopup)}
              className="relative flex items-center gap-2 rounded-lg border border-[#D4AF37]/50 bg-[#111111] px-3 py-1.5 text-xs font-mono text-[#D4AF37] hover:bg-[#1a1a1a] transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>EXTENSION POPUP</span>
            </button>
          </div>
        </div>

        {/* Browser simulated address bar */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/5 bg-[#050505] px-3 py-2 text-xs font-mono text-neutral-400">
          <span className="text-neutral-600">HTTPS://</span>
          <span className="text-white truncate">{currentProduct.url}</span>
          <span className="ml-auto text-[11px] text-[#8FD3FF] font-semibold uppercase tracking-wider">
            {currentProduct.marketplace} Adapter Active
          </span>
        </div>
      </div>

      {/* Main Simulation Viewport: Mock E-Commerce Page */}
      <div className="relative min-h-[640px] rounded-2xl border border-white/10 bg-[#090909] overflow-hidden shadow-2xl">
        {/* Marketplace Mock Header */}
        <div className="border-b border-white/10 bg-[#111111] px-6 py-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight text-white uppercase">
              {currentProduct.marketplace}
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400 hidden sm:inline">Delivering to 560001 - Bengaluru</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Returns & Orders</span>
            <span>Cart (0)</span>
          </div>
        </div>

        {/* E-Commerce Product Content */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Image Section */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-square rounded-xl border border-white/10 bg-[#111111] flex items-center justify-center p-6 overflow-hidden">
              <img
                src={currentProduct.images[0]}
                alt={currentProduct.title}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
              <div className="absolute top-3 left-3 rounded border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-mono text-[#8FD3FF]">
                {currentProduct.category}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="text-xs text-neutral-500 font-mono">Hover to inspect DOM attributes</span>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
                Brand: {currentProduct.brand}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {currentProduct.title}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                <span className="text-[#FFD54A] font-semibold">★ {currentProduct.rating}</span>
                <span>·</span>
                <span>{currentProduct.ratingCount.toLocaleString()} ratings</span>
                <span>·</span>
                <span>{currentProduct.reviewCount} customer reviews</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4 flex items-baseline gap-4">
              <span className="font-mono text-3xl font-extrabold text-white">
                ₹{currentProduct.currentPrice.toLocaleString()}
              </span>
              <span className="font-mono text-sm text-neutral-500 line-through">
                M.R.P.: ₹{currentProduct.originalPrice.toLocaleString()}
              </span>
              <span className="font-mono text-sm font-semibold text-[#FFD54A]">
                -{currentProduct.discountPercent}% Off
              </span>
            </div>

            {/* Urgency text if any */}
            {currentProduct.urgencyText && (
              <div className="rounded-lg border border-[#FFD54A]/30 bg-[#FFD54A]/10 p-3 text-xs font-mono text-[#FFE680]">
                ⚠ {currentProduct.urgencyText}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              <p>{currentProduct.description}</p>
            </div>

            {/* Seller Box */}
            <div className="rounded-xl border border-white/5 bg-[#050505] p-4 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Sold By:</span>
                <span className="text-white font-semibold">{currentProduct.seller.name}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Seller Rating:</span>
                <span className="text-[#8FD3FF]">{currentProduct.seller.rating} / 5.0 ({currentProduct.seller.ratingCount} ratings)</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Fulfilment:</span>
                <span className="text-white">
                  {currentProduct.seller.isFulfilledByPlatform ? 'Fulfilled by Marketplace' : '3rd-Party Merchant Direct'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Return Guarantee:</span>
                <span className="text-neutral-300">{currentProduct.returnPolicy || currentProduct.seller.returnPolicy}</span>
              </div>
            </div>

            {/* Action buttons on mock page */}
            <div className="flex gap-4 pt-2">
              <button className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-neutral-200 transition-colors">
                Add to Cart
              </button>
              <button className="flex-1 rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-[#FFE680] transition-colors">
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* AEGIS IN-PAGE FLOATING EXTENSION OVERLAY COMPONENT       */}
        {/* ======================================================== */}
        {isOverlayVisible && (
          <div className="absolute bottom-6 right-6 z-40 max-w-sm w-full">
            {/* Step 1: Permission Prompt if not granted */}
            {!permissionGranted && showPermissionPrompt ? (
              <div className="rounded-2xl border border-[#D4AF37] bg-[#050505]/95 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/50 bg-[#111111]">
                    <svg className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-bold text-white">AEGIS PROTECTION</h4>
                    <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                      AEGIS detected an e-commerce listing on <span className="text-[#8FD3FF] font-semibold">{currentProduct.marketplace}</span>. Would you like AEGIS to scan this listing for potential shopping risks?
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      *Only visible public page information is analyzed. Zero access to credentials or checkout details.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 font-mono text-xs">
                  <button
                    onClick={() => handleAllowPermission(false)}
                    className="w-full rounded-lg bg-[#D4AF37] py-2 font-semibold text-black hover:bg-[#FFE680] transition-colors"
                  >
                    SCAN THIS LISTING
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAllowPermission(true)}
                      className="flex-1 rounded-lg border border-white/20 bg-[#111111] py-1.5 text-neutral-300 hover:text-white hover:border-white transition-colors"
                    >
                      Always on this site
                    </button>
                    <button
                      onClick={() => setShowPermissionPrompt(false)}
                      className="flex-1 rounded-lg border border-white/10 bg-[#111111] py-1.5 text-neutral-500 hover:text-white transition-colors"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Step 2: Floating Button when minimized */}
            {permissionGranted && !isOverlayExpanded && (
              <button
                onClick={() => setIsOverlayExpanded(true)}
                className="ml-auto flex items-center gap-2.5 rounded-full border border-[#D4AF37] bg-[#090909] px-4 py-2.5 shadow-2xl hover:border-[#FFE680] transition-all"
              >
                <div className="h-2 w-2 rounded-full bg-[#8FD3FF] animate-pulse" />
                <span className="font-mono text-xs font-bold tracking-wider text-white">AEGIS</span>
                {scanResult && (
                  <span className="font-mono text-xs font-bold text-[#FFD54A]">
                    {scanResult.overallScore}/100
                  </span>
                )}
              </button>
            )}

            {/* Step 3: Expanded 3D Floating Overlay Card */}
            {permissionGranted && isOverlayExpanded && (
              <div className="rounded-2xl border border-[#D4AF37]/50 bg-[#050505]/95 p-5 shadow-2xl backdrop-blur-xl">
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-[#8FD3FF] animate-pulse" />
                    <span>3D AEGIS CORE</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <button
                      onClick={() => handlePerformScan(currentProduct)}
                      title="Re-scan current page"
                      className="hover:text-white text-xs font-mono"
                    >
                      ↺ SCAN
                    </button>
                    <button
                      onClick={() => setIsOverlayExpanded(false)}
                      className="hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 3D Shield Display */}
                <div className="py-2 flex justify-center">
                  <AegisShield3D
                    size="compact"
                    isScanning={isScanning}
                    score={scanResult?.overallScore || 18}
                    riskLevel={scanResult?.riskLevel || 'LOW'}
                  />
                </div>

                {/* Risk Score & Verdict */}
                {scanResult ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-white/10 bg-[#111111] p-3 text-center">
                      <div className="text-[11px] font-mono uppercase text-neutral-400">
                        VERDICT: {scanResult.verdict}
                      </div>
                      <div className="mt-1 font-mono text-xl font-bold text-white">
                        RISK SCORE: <span className="text-[#FFD54A]">{scanResult.overallScore}</span> / 100
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {scanResult.riskLevel} RISK LEVEL ({Math.round(scanResult.confidence * 100)}% Confidence)
                      </div>
                    </div>

                    {/* Breakdown signals checklist */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-2">
                          <span className={scanResult.priceIntel.isAnomaly ? 'text-[#FFD54A]' : 'text-[#8FD3FF]'}>
                            {scanResult.priceIntel.isAnomaly ? '⚠' : '✓'}
                          </span>
                          Price Intelligence
                        </span>
                        <span className="text-neutral-400 tabular-nums">{scanResult.priceIntel.score}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-2">
                          <span className={scanResult.sellerIntel.score > 40 ? 'text-[#FFD54A]' : 'text-[#8FD3FF]'}>
                            {scanResult.sellerIntel.score > 40 ? '⚠' : '✓'}
                          </span>
                          Seller Signals
                        </span>
                        <span className="text-neutral-400 tabular-nums">{scanResult.sellerIntel.score}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-2">
                          <span className={scanResult.reviewIntel.score > 40 ? 'text-[#FFD54A]' : 'text-[#8FD3FF]'}>
                            {scanResult.reviewIntel.score > 40 ? '⚠' : '✓'}
                          </span>
                          Review Integrity
                        </span>
                        <span className="text-neutral-400 tabular-nums">{scanResult.reviewIntel.score}/100</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-2">
                          <span className={scanResult.scamLanguageIntel.offPlatformPaymentRisk ? 'text-[#FFD54A]' : 'text-[#8FD3FF]'}>
                            {scanResult.scamLanguageIntel.offPlatformPaymentRisk ? '⚠' : '✓'}
                          </span>
                          Scam / Payment Risk
                        </span>
                        <span className="text-neutral-400 tabular-nums">{scanResult.scamLanguageIntel.score}/100</span>
                      </div>
                    </div>

                    {/* Action buttons: Track + Expand Full Report */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const isCurrentlyTracked = aegisDb.isProductTracked(currentProduct.id);
                          if (isCurrentlyTracked) {
                            aegisDb.untrackProduct(currentProduct.id);
                          } else {
                            aegisDb.trackProduct(currentProduct);
                          }
                          setIsOverlayExpanded(true);
                        }}
                        className={`rounded-xl border px-3 py-2 font-mono text-xs transition-colors flex items-center justify-center gap-1.5 ${
                          aegisDb.isProductTracked(currentProduct.id)
                            ? 'border-[#8FD3FF] bg-[#111111] text-[#8FD3FF] font-semibold'
                            : 'border-white/10 bg-[#111111] text-neutral-400 hover:text-white'
                        }`}
                        title="Add to real-time price & seller rating tracking watchlist"
                      >
                        <span>{aegisDb.isProductTracked(currentProduct.id) ? '◉ Watching' : '+ Watch'}</span>
                      </button>
                      <button
                        onClick={() => onViewFullReport(scanResult)}
                        className="flex-1 rounded-xl border border-[#D4AF37] bg-[#D4AF37] py-2 font-mono text-xs font-bold text-black uppercase tracking-wider hover:bg-[#FFE680] transition-colors"
                      >
                        FULL 3D REPORT →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-neutral-400 font-mono">
                      {isScanning ? 'Extracting visible DOM data & executing AI engine...' : 'Ready to analyze.'}
                    </p>
                    {!isScanning && (
                      <button
                        onClick={() => handlePerformScan(currentProduct)}
                        className="mt-3 w-full rounded-xl bg-[#D4AF37] py-2 text-xs font-mono font-bold text-black hover:bg-[#FFE680]"
                      >
                        RUN INSTANT SCAN
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extension Popup Dialog Simulation */}
      {showExtensionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#D4AF37] bg-[#050505] p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="font-bold text-white text-sm">AEGIS EXTENSION</span>
              </div>
              <button onClick={() => setShowExtensionPopup(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#111111] p-3">
                <span className="text-neutral-400">Protection Status:</span>
                <span className="text-[#8FD3FF] font-semibold">PROTECTION ACTIVE</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#111111] p-3">
                <span className="text-neutral-400">Current Site:</span>
                <span className="text-white font-semibold">{currentProduct.marketplace}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#111111] p-3">
                <span className="text-neutral-400">Auto-Scan Listing:</span>
                <button
                  onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                  className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                    autoScanEnabled ? 'bg-[#D4AF37] text-black' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {autoScanEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#111111] p-3">
                <span className="text-neutral-400">Site Permission:</span>
                <span className="text-neutral-300">
                  {permissionGranted ? 'Granted' : 'Pending Consent'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowExtensionPopup(false);
                if (scanResult) onViewFullReport(scanResult);
              }}
              className="w-full rounded-xl bg-[#D4AF37] py-2 text-xs font-bold text-black uppercase hover:bg-[#FFE680]"
            >
              OPEN AEGIS DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
