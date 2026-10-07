import React, { useEffect, useState } from 'react';
import { ProductListing, AegisAnalysisResult } from '../types/aegis';
import { runAegisRiskPipeline } from '../services/riskEngine';
import { AegisShield3D } from './AegisShield3D';

interface ScanProgressModalProps {
  product: ProductListing;
  isOpen: boolean;
  onComplete: (result: AegisAnalysisResult) => void;
  onCancel: () => void;
}

interface ScanStep {
  id: string;
  label: string;
  detail: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETE';
}

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({
  product,
  isOpen,
  onComplete,
  onCancel,
}) => {
  const [steps, setSteps] = useState<ScanStep[]>([
    { id: '1', label: 'SCANNING PRODUCT', detail: 'Extracting DOM tokens & metadata', status: 'PENDING' },
    { id: '2', label: 'ANALYSING PRICE', detail: 'Evaluating discount rate & category baseline', status: 'PENDING' },
    { id: '3', label: 'CHECKING SELLER SIGNALS', detail: 'Tenure, fulfillment & rating distribution', status: 'PENDING' },
    { id: '4', label: 'ANALYSING REVIEWS', detail: 'Tri-gram similarity & sentiment dissonance', status: 'PENDING' },
    { id: '5', label: 'ANALYSING DESCRIPTION', detail: 'NLP scan for urgency & contradictory specs', status: 'PENDING' },
    { id: '6', label: 'CALCULATING RISK', detail: 'Executing multi-factor risk engine', status: 'PENDING' },
    { id: '7', label: 'GENERATING EXPLANATION', detail: 'Formulating explainable decision vector', status: 'PENDING' },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [computedResult, setComputedResult] = useState<AegisAnalysisResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset steps
    setSteps((prev) => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'RUNNING' : 'PENDING' })));
    setCurrentStepIndex(0);

    // Run real pipeline calculation
    const realResult = runAegisRiskPipeline(product);
    setComputedResult(realResult);

    // Orchestrate step-by-step progress matching real execution
    const interval = setInterval(() => {
      setCurrentStepIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= 7) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete(realResult);
          }, 450);
          return prevIdx;
        }

        setSteps((currentSteps) =>
          currentSteps.map((step, idx) => {
            if (idx < nextIdx) return { ...step, status: 'COMPLETE' };
            if (idx === nextIdx) return { ...step, status: 'RUNNING' };
            return { ...step, status: 'PENDING' };
          })
        );
        return nextIdx;
      });
    }, 380);

    return () => clearInterval(interval);
  }, [isOpen, product]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#D4AF37]/30 bg-[#090909] p-6 shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#111111]">
              <svg
                className="h-5 w-5 text-[#D4AF37]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 className="font-mono text-base font-semibold text-white tracking-wide">
                AEGIS PIPELINE ACTIVE
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-md">
                {product.marketplace}: {product.title}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-mono uppercase text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* 3D Shield in Scanning Mode */}
        <div className="my-4 flex justify-center">
          <AegisShield3D
            size="small"
            isScanning={true}
            riskLevel={computedResult?.riskLevel || 'LOW'}
            score={computedResult?.overallScore || 20}
          />
        </div>

        {/* Real Step Execution Sequence */}
        <div className="space-y-2.5 rounded-xl border border-white/5 bg-[#111111]/70 p-4 font-mono text-xs">
          {steps.map((step, idx) => {
            const isRunning = step.status === 'RUNNING';
            const isDone = step.status === 'COMPLETE';

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between transition-colors ${
                  isRunning
                    ? 'text-[#8FD3FF] font-semibold'
                    : isDone
                    ? 'text-white/80'
                    : 'text-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-neutral-500">0{idx + 1}.</span>
                  <span>{step.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">{step.detail}</span>
                  {isRunning && (
                    <span className="h-2 w-2 rounded-full bg-[#8FD3FF] animate-ping" />
                  )}
                  {isDone && (
                    <span className="text-[#8FD3FF] font-bold">✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Status Ticker */}
        <div className="mt-5 flex items-center justify-between text-xs text-neutral-400">
          <span>Processing Visible Page Attributes Only</span>
          <span className="font-mono text-[#8FD3FF]">Phase {currentStepIndex + 1} of 7</span>
        </div>
      </div>
    </div>
  );
};
