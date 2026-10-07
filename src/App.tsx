import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { ExtensionSimulator } from './components/ExtensionSimulator';
import { ManualAnalyzePage } from './pages/ManualAnalyzePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductReportPage } from './pages/ProductReportPage';
import { ComparePage } from './pages/ComparePage';
import { PricingPage } from './pages/PricingPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { AegisAnalysisResult } from './types/aegis';
import { aegisDb } from './services/db';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AegisAnalysisResult | null>(() => {
    const list = aegisDb.getAllAnalyses();
    return list[0] || null;
  });

  const handleViewReport = (analysis: AegisAnalysisResult) => {
    setSelectedAnalysis(analysis);
    setCurrentTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareWithOthers = (analysis: AegisAnalysisResult) => {
    setSelectedAnalysis(analysis);
    setCurrentTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black font-sans antialiased">
      {/* Universal Top Bar */}
      <Navigation
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main View Router */}
      <main className="min-h-[calc(100vh-4rem)]">
        {currentTab === 'landing' && (
          <LandingPage onNavigate={(tab) => setCurrentTab(tab)} />
        )}

        {currentTab === 'extension-sim' && (
          <ExtensionSimulator onViewFullReport={handleViewReport} />
        )}

        {currentTab === 'scanner' && (
          <ManualAnalyzePage onViewReport={handleViewReport} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage onViewReport={handleViewReport} />
        )}

        {currentTab === 'report' && selectedAnalysis && (
          <ProductReportPage
            analysis={selectedAnalysis}
            onBack={() => setCurrentTab('dashboard')}
            onCompareWithOthers={handleCompareWithOthers}
          />
        )}

        {currentTab === 'compare' && (
          <ComparePage
            initialAnalysis={selectedAnalysis}
            onViewReport={handleViewReport}
          />
        )}

        {currentTab === 'pricing' && <PricingPage />}

        {currentTab === 'insights' && <ModelInsightsPage />}

        {currentTab === 'settings' && <SettingsPage />}

        {currentTab === 'admin' && (
          <AdminPage
            onLaunchScenario={handleViewReport}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
