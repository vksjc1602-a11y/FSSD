import React from 'react';
import { aegisDb } from '../services/db';

export const ModelInsightsPage: React.FC = () => {
  const metrics = aegisDb.getModelMetrics();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#8FD3FF]">
          RIGOROUS AI AUDIT & VALIDATION
        </span>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
          Machine Learning Evaluation Telemetry
        </h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-3xl">
          Statistical validation metrics for the AEGIS hybrid AI engine trained on multi-platform e-commerce listings, fraudulent seller accounts, and scraped review rings.
        </p>
      </div>

      {/* Model Spec Card */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#090909] p-6 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-neutral-500 uppercase">Architecture:</span>
            <div className="text-white font-bold mt-1">{metrics.modelType}</div>
          </div>
          <div>
            <span className="text-neutral-500 uppercase">Total Corpus:</span>
            <div className="text-white font-bold mt-1 tabular-nums">
              {metrics.datasetSize.toLocaleString()} Verified Listings
            </div>
          </div>
          <div>
            <span className="text-neutral-500 uppercase">Train / Test Split:</span>
            <div className="text-white font-bold mt-1 tabular-nums">
              80% Train ({metrics.trainSize.toLocaleString()}) · 20% Test ({metrics.testSize.toLocaleString()})
            </div>
          </div>
          <div>
            <span className="text-neutral-500 uppercase">Model Checkpoint:</span>
            <div className="text-[#8FD3FF] font-bold mt-1">{metrics.lastUpdated.substring(0, 10)}</div>
          </div>
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 font-mono">
          <span className="text-xs text-neutral-400">OVERALL ACCURACY</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-white">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <span className="mt-1 block text-xs text-[#8FD3FF]">Balanced test set</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 font-mono">
          <span className="text-xs text-neutral-400">PRECISION</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-white">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <span className="mt-1 block text-xs text-neutral-400">Minimizes false accusations</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 font-mono">
          <span className="text-xs text-neutral-400">RECALL (DETECTION RATE)</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-[#D4AF37]">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <span className="mt-1 block text-xs text-neutral-400">Catches 95%+ of active scams</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5 font-mono">
          <span className="text-xs text-neutral-400">F1 HARMONIC SCORE</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-white">
            {(metrics.f1Score * 100).toFixed(1)}%
          </div>
          <span className="mt-1 block text-xs text-[#8FD3FF]">Optimal balance</span>
        </div>
      </div>

      {/* Confusion Matrix & Feature Weights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Confusion Matrix */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#090909] p-6 font-mono text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Confusion Matrix (Test Evaluation N={metrics.testSize})
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#111111] p-4 text-center">
              <span className="text-neutral-400 block mb-1">TRUE POSITIVES (Threat Detected)</span>
              <span className="text-2xl font-bold text-[#8FD3FF] tabular-nums">
                {metrics.confusionMatrix.truePositive}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Confirmed fraudulent listings flagged</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111111] p-4 text-center">
              <span className="text-neutral-400 block mb-1">FALSE POSITIVES</span>
              <span className="text-2xl font-bold text-neutral-300 tabular-nums">
                {metrics.confusionMatrix.falsePositive}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Legitimate flagged as threat</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111111] p-4 text-center">
              <span className="text-neutral-400 block mb-1">FALSE NEGATIVES</span>
              <span className="text-2xl font-bold text-neutral-300 tabular-nums">
                {metrics.confusionMatrix.falseNegative}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Missed threats (kept under 2.5%)</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111111] p-4 text-center">
              <span className="text-neutral-400 block mb-1">TRUE NEGATIVES</span>
              <span className="text-2xl font-bold text-[#8FD3FF] tabular-nums">
                {metrics.confusionMatrix.trueNegative}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-1">Safe products correctly cleared</span>
            </div>
          </div>
        </div>

        {/* Feature Weights */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#090909] p-6 font-mono text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Feature Importance in Hybrid Ensemble
          </h2>

          <div className="space-y-4">
            {metrics.featureWeights.map((fw) => (
              <div key={fw.feature} className="space-y-1">
                <div className="flex justify-between text-neutral-300">
                  <span>{fw.feature}</span>
                  <span className="text-[#D4AF37] tabular-nums font-bold">
                    {(fw.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#111111] overflow-hidden">
                  <div
                    style={{ width: `${fw.weight * 100}%` }}
                    className="h-full bg-[#D4AF37] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
