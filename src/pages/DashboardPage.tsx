import React, { useState, useEffect } from 'react';
import { AegisAnalysisResult, DashboardStats, AegisNotification, TrackedProduct } from '../types/aegis';
import { aegisDb, DEMO_PRODUCTS } from '../services/db';

interface DashboardPageProps {
  onViewReport: (result: AegisAnalysisResult) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onViewReport }) => {
  const [stats, setStats] = useState<DashboardStats>(() => aegisDb.getDashboardStats());
  const [activeView, setActiveView] = useState<'ALERTS' | 'WATCHLIST' | 'SCANS'>('ALERTS');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'UNREAD' | 'PRICE' | 'SELLER'>('ALL');
  const [liveBannerAlert, setLiveBannerAlert] = useState<AegisNotification | null>(() => {
    const unread = aegisDb.getNotifications().filter((n) => !n.read);
    return unread[0] || null;
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = aegisDb.subscribeToNotifications((newNotif) => {
      setStats(aegisDb.getDashboardStats());
      setLiveBannerAlert(newNotif);
      setFeedbackMsg(`Alert Triggered: ${newNotif.title}`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    });
    return unsubscribe;
  }, []);

  const refreshStats = () => {
    const updated = aegisDb.getDashboardStats();
    setStats(updated);
    const unread = updated.notifications.filter((n) => !n.read);
    setLiveBannerAlert(unread[0] || null);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all stored scan records?')) {
      aegisDb.clearAllHistory();
      refreshStats();
    }
  };

  const handleMarkAsRead = (id: string) => {
    aegisDb.markNotificationAsRead(id);
    refreshStats();
  };

  const handleMarkAllRead = () => {
    aegisDb.markAllNotificationsAsRead();
    refreshStats();
    setLiveBannerAlert(null);
  };

  const handleClearNotification = (id: string) => {
    aegisDb.clearNotification(id);
    refreshStats();
  };

  const handleSimulateEvent = (
    productId: string,
    eventType: 'PRICE_HIKE' | 'SELLER_RATING_DROP' | 'SURGE_AND_RATING_DROP'
  ) => {
    const notif = aegisDb.simulateProductEvent(productId, eventType);
    if (notif) {
      refreshStats();
      setLiveBannerAlert(notif);
      setFeedbackMsg(`Simulated ${eventType.replace(/_/g, ' ')} for ${notif.productTitle.substring(0, 30)}...`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleTrackNewProduct = (productId: string) => {
    const prod = DEMO_PRODUCTS.find((p) => p.id === productId);
    if (prod) {
      aegisDb.trackProduct(prod);
      refreshStats();
      setFeedbackMsg(`Added ${prod.title.substring(0, 35)}... to tracked products.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleUntrack = (productId: string) => {
    aegisDb.untrackProduct(productId);
    refreshStats();
  };

  const handleInspectProductReport = (productId: string) => {
    const analysis = aegisDb.getLatestAnalysisForProduct(productId);
    if (analysis) {
      onViewReport(analysis);
    } else {
      const prod = DEMO_PRODUCTS.find((p) => p.id === productId);
      if (prod) {
        const newResult = aegisDb.analyzeAndSave(prod, true);
        onViewReport(newResult);
      }
    }
  };

  // Filtered notifications list
  const filteredNotifications = stats.notifications.filter((n) => {
    if (alertFilter === 'UNREAD') return !n.read;
    if (alertFilter === 'PRICE') return n.type === 'PRICE_HIKE';
    if (alertFilter === 'SELLER') return n.type === 'SELLER_RATING_DROP' || n.type === 'SUSPICIOUS_SELLER_CHANGE';
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Real-Time Live Alert Banner (when critical/warning unread alert exists) */}
      {liveBannerAlert && (
        <div className="mb-6 rounded-2xl border border-[#D4AF37] bg-[#090909] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/50 bg-[#111111] text-[#FFD54A]">
                <svg className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-[#FFD54A] animate-ping" />
                  <span className="font-bold text-[#FFD54A]">REAL-TIME TELEMETRY ALERT</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-neutral-400">{liveBannerAlert.marketplace}</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-[#8FD3FF] font-semibold">{liveBannerAlert.type.replace(/_/g, ' ')}</span>
                </div>
                <h3 className="mt-1 font-mono text-base font-bold text-white">
                  {liveBannerAlert.title}
                </h3>
                <p className="mt-1 text-xs text-neutral-300 max-w-3xl leading-relaxed">
                  {liveBannerAlert.message}
                </p>
                <div className="mt-2 text-[11px] font-mono text-neutral-400">
                  Evidence: <span className="text-white">{liveBannerAlert.details.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 font-mono text-xs">
              <button
                onClick={() => handleInspectProductReport(liveBannerAlert.productId)}
                className="rounded-lg border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 font-bold text-black uppercase hover:bg-[#FFE680] transition-colors"
              >
                Inspect Threat →
              </button>
              <button
                onClick={() => {
                  handleMarkAsRead(liveBannerAlert.id);
                  setLiveBannerAlert(null);
                }}
                className="rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {feedbackMsg && (
        <div className="mb-4 rounded-xl border border-[#8FD3FF] bg-[#111111] p-3 text-center font-mono text-xs text-[#8FD3FF]">
          ✓ {feedbackMsg}
        </div>
      )}

      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
            SECURITY TELEMETRY COMMAND
          </span>
          <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">
            My AEGIS Dashboard
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Real-time aggregate threat telemetry, price surge monitoring & seller rating anomaly tracking
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => setActiveView('ALERTS')}
            className={`rounded-lg px-3 py-2 transition-colors flex items-center gap-2 ${
              activeView === 'ALERTS'
                ? 'border border-[#D4AF37] bg-[#111111] text-[#D4AF37] font-bold'
                : 'border border-white/10 bg-[#090909] text-neutral-400 hover:text-white'
            }`}
          >
            <span>Live Alerts</span>
            {stats.unreadNotificationsCount > 0 && (
              <span className="rounded-full bg-[#D4AF37] px-1.5 py-0.2 text-[10px] text-black font-extrabold">
                {stats.unreadNotificationsCount}
              </span>
            )}
          </button>
          <button
            onClick={handleClearHistory}
            className="rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Clear Scans
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono">
        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-400">UNREAD THREAT ALERTS</span>
            <span className="h-2 w-2 rounded-full bg-[#FFD54A] animate-pulse" />
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-[#FFD54A]">
            {stats.unreadNotificationsCount}
          </div>
          <span className="mt-1 block text-xs text-neutral-400">
            {stats.notifications.length} total logged events
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-xs text-neutral-400">TRACKED WATCHLIST</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-white">
            {stats.activeTrackedProductsCount}
          </div>
          <span className="mt-1 block text-xs text-[#8FD3FF]">Active background watchers</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-xs text-neutral-400">HIGH & CRITICAL THREATS</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-[#D4AF37]">
            {stats.highRiskCount}
          </div>
          <span className="mt-1 block text-xs text-neutral-400">Scams & counterfeit traps</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090909] p-5">
          <span className="text-xs text-neutral-400">TOTAL SCANS RECORDED</span>
          <div className="mt-2 text-3xl font-bold tabular-nums text-white">
            {stats.totalScans}
          </div>
          <span className="mt-1 block text-xs text-neutral-400">Average Risk: {stats.averageRiskScore}/100</span>
        </div>
      </div>

      {/* Segmented View Switcher Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView('ALERTS')}
            className={`pb-3 transition-colors flex items-center gap-2 ${
              activeView === 'ALERTS'
                ? 'border-b-2 border-[#D4AF37] text-[#D4AF37] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>01. Real-Time Threat Alerts</span>
            {stats.unreadNotificationsCount > 0 && (
              <span className="rounded bg-[#D4AF37] px-1.5 py-0.5 text-[10px] text-black font-extrabold">
                {stats.unreadNotificationsCount} NEW
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('WATCHLIST')}
            className={`pb-3 transition-colors flex items-center gap-2 ${
              activeView === 'WATCHLIST'
                ? 'border-b-2 border-[#8FD3FF] text-[#8FD3FF] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>02. Tracked Products Watchlist ({stats.trackedProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveView('SCANS')}
            className={`pb-3 transition-colors ${
              activeView === 'SCANS'
                ? 'border-b-2 border-white text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            03. Audit Scan History ({stats.recentAnalyses.length})
          </button>
        </div>

        {activeView === 'ALERTS' && stats.unreadNotificationsCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-neutral-400 hover:text-[#D4AF37] transition-colors"
          >
            Mark all read ✓
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: REAL-TIME THREAT ALERTS & NOTIFICATIONS FEED      */}
      {/* ======================================================== */}
      {activeView === 'ALERTS' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#090909] p-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 mr-1">Filter:</span>
              <button
                onClick={() => setAlertFilter('ALL')}
                className={`rounded px-2.5 py-1 ${
                  alertFilter === 'ALL' ? 'bg-[#111111] text-white border border-white/20' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({stats.notifications.length})
              </button>
              <button
                onClick={() => setAlertFilter('UNREAD')}
                className={`rounded px-2.5 py-1 ${
                  alertFilter === 'UNREAD' ? 'bg-[#D4AF37] text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Unread ({stats.unreadNotificationsCount})
              </button>
              <button
                onClick={() => setAlertFilter('PRICE')}
                className={`rounded px-2.5 py-1 ${
                  alertFilter === 'PRICE' ? 'bg-[#111111] text-[#FFD54A] border border-[#FFD54A]/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Price Hikes
              </button>
              <button
                onClick={() => setAlertFilter('SELLER')}
                className={`rounded px-2.5 py-1 ${
                  alertFilter === 'SELLER' ? 'bg-[#111111] text-[#8FD3FF] border border-[#8FD3FF]/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Seller Rating Drops
              </button>
            </div>

            <div className="text-[11px] text-neutral-400">
              Auto-updating via client event stream
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#090909] p-12 text-center font-mono text-xs text-neutral-400">
              No threat alerts matching selected filter. All tracked products are operating within normal variance thresholds.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    !n.read
                      ? 'border-[#D4AF37]/60 bg-[#090909] shadow-lg'
                      : 'border-white/5 bg-[#090909]/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            n.severity === 'CRITICAL'
                              ? 'bg-[#FFD54A]/20 text-[#FFD54A]'
                              : n.severity === 'WARNING'
                              ? 'bg-[#D4AF37]/20 text-[#FFE680]'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {n.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-neutral-400 font-sans">{n.marketplace}</span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-neutral-500 text-[11px]">{n.timestamp.substring(11, 16)} UTC</span>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD54A] animate-pulse" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white font-sans">
                        {n.title}
                      </h4>
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                        {n.message}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
                        {n.details.percentageChange !== undefined && (
                          <div>
                            Delta:{' '}
                            <span className={n.details.percentageChange > 0 ? 'text-[#FFD54A] font-bold' : 'text-[#8FD3FF] font-bold'}>
                              {n.details.percentageChange > 0 ? `+${n.details.percentageChange}%` : `${n.details.percentageChange}%`}
                            </span>
                          </div>
                        )}
                        <div>
                          Shift: <span className="text-white font-medium">{n.details.oldValue} → {n.details.newValue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInspectProductReport(n.productId)}
                        className="rounded-lg border border-[#D4AF37] bg-[#111111] px-3 py-1.5 text-xs text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                      >
                        Inspect Listing →
                      </button>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="rounded-lg border border-white/10 bg-[#111111] px-2.5 py-1.5 text-neutral-400 hover:text-white transition-colors"
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleClearNotification(n.id)}
                        className="rounded-lg border border-white/10 bg-[#111111] px-2.5 py-1.5 text-neutral-500 hover:text-white transition-colors"
                        title="Delete alert"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: TRACKED PRODUCTS WATCHLIST & EVENT SIMULATOR     */}
      {/* ======================================================== */}
      {activeView === 'WATCHLIST' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#090909] p-4 font-mono text-xs">
            <div>
              <span className="text-white font-bold">REAL-TIME MONITORING WATCHLIST</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                AEGIS continuously monitors listed price velocity and seller review streams for discrepancies
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Track Listing:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleTrackNewProduct(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="rounded border border-white/10 bg-[#111111] px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="" disabled>
                  + Add Product to Watchlist...
                </option>
                {DEMO_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.marketplace}: {p.title.substring(0, 32)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            {stats.trackedProducts.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors ${
                  item.status === 'ALERT'
                    ? 'border-[#D4AF37] bg-[#090909]'
                    : 'border-white/10 bg-[#090909]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <span className="text-[#8FD3FF] font-semibold">{item.marketplace}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.status === 'ALERT'
                          ? 'bg-[#FFD54A]/20 text-[#FFD54A]'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {item.status === 'ALERT' ? `ALERT ACTIVE (${item.activeAlertCount})` : 'NORMAL TRACKING'}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-white text-xs line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-neutral-300 divide-y divide-white/5">
                    <div className="pt-1 flex justify-between">
                      <span className="text-neutral-400">Current Price:</span>
                      <span className="text-white font-bold tabular-nums">
                        ₹{item.currentPrice.toLocaleString()}{' '}
                        {item.priceChangePercent !== 0 && (
                          <span className={item.priceChangePercent > 0 ? 'text-[#FFD54A]' : 'text-[#8FD3FF]'}>
                            ({item.priceChangePercent > 0 ? `+${item.priceChangePercent}%` : `${item.priceChangePercent}%`})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-neutral-400">Seller & Rating:</span>
                      <span className="text-white font-bold tabular-nums">
                        {item.currentSellerRating} ★{' '}
                        {item.sellerRatingDelta !== 0 && (
                          <span className={item.sellerRatingDelta < 0 ? 'text-[#FFD54A]' : 'text-[#8FD3FF]'}>
                            ({item.sellerRatingDelta}★)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <span className="text-neutral-400">Storefront:</span>
                      <span className="text-neutral-300 truncate max-w-[140px]">{item.sellerName}</span>
                    </div>

                    <div className="pt-2 flex justify-between text-[11px] text-neutral-500">
                      <span>Monitored Points:</span>
                      <span>{item.priceHistory.length} checkpoints</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Trigger Bar (Judges Showcase) */}
                <div className="mt-5 pt-3 border-t border-white/5 space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                    Interactive Event Simulation:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulateEvent(item.productId, 'PRICE_HIKE')}
                      className="rounded-lg border border-[#FFD54A]/30 bg-[#111111] py-1.5 text-[11px] text-[#FFE680] hover:border-[#FFD54A] hover:bg-[#FFD54A] hover:text-black transition-colors"
                      title="Trigger sudden +30% price surge"
                    >
                      ⚡ Price Hike (+30%)
                    </button>
                    <button
                      onClick={() => handleSimulateEvent(item.productId, 'SELLER_RATING_DROP')}
                      className="rounded-lg border border-[#D4AF37]/30 bg-[#111111] py-1.5 text-[11px] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                      title="Trigger seller rating drop -0.8 stars"
                    >
                      ⚡ Rating Drop (-0.8★)
                    </button>
                  </div>
                  <button
                    onClick={() => handleSimulateEvent(item.productId, 'SURGE_AND_RATING_DROP')}
                    className="w-full rounded-lg border border-white/10 bg-[#050505] py-1.5 text-[11px] text-neutral-300 hover:text-white hover:border-white transition-colors"
                  >
                    ⚡ Combined Surge & Rating Plunge
                  </button>

                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => handleInspectProductReport(item.productId)}
                      className="text-[#8FD3FF] hover:underline"
                    >
                      Open 3D Report →
                    </button>
                    <button
                      onClick={() => handleUntrack(item.productId)}
                      className="text-neutral-500 hover:text-neutral-300"
                    >
                      Untrack
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: RECENT AUDIT SCAN RECORDS TABLE                   */}
      {/* ======================================================== */}
      {activeView === 'SCANS' && (
        <div className="rounded-2xl border border-white/10 bg-[#090909] overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Recent Analysis Records
            </h2>
            <span className="text-xs font-mono text-[#8FD3FF]">Live Session Store</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-white/5 bg-[#111111] text-neutral-400">
                <tr>
                  <th className="py-3 px-6">Marketplace & Product</th>
                  <th className="py-3 px-6 text-right">Price</th>
                  <th className="py-3 px-6 text-center">AEGIS Score</th>
                  <th className="py-3 px-6">Risk Category</th>
                  <th className="py-3 px-6">Verdict</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentAnalyses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No scans in current session. Run a listing audit to populate telemetry.
                    </td>
                  </tr>
                ) : (
                  stats.recentAnalyses.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white font-sans max-w-sm truncate">
                          {item.productSnapshot.title}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {item.productSnapshot.marketplace} · {item.productSnapshot.brand}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right tabular-nums text-white">
                        ₹{item.productSnapshot.currentPrice.toLocaleString()}
                        <div className="text-[10px] text-neutral-500">
                          -{item.productSnapshot.discountPercent}%
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-base tabular-nums text-white">
                          {item.overallScore}
                        </span>
                        <span className="text-neutral-500 text-[10px]"> / 100</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-semibold ${
                            item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
                              ? 'text-[#FFD54A]'
                              : item.riskLevel === 'ELEVATED'
                              ? 'text-[#FFE680]'
                              : 'text-[#8FD3FF]'
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-neutral-300">
                        {item.verdict}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onViewReport(item)}
                          className="rounded-lg border border-[#D4AF37]/40 bg-[#111111] px-3 py-1.5 text-xs text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
