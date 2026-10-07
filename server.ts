import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { aegisDb } from './src/services/db';
import { runAegisRiskPipeline } from './src/services/riskEngine';
import { ProductListing } from './src/types/aegis';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body parsing with safety limits
  app.use(express.json({ limit: '10mb' }));

  // Security headers & CORS
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ========================================================
  // AEGIS REST API v1 ROUTES
  // ========================================================

  // 1. Health check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'AEGIS Commerce Risk Engine',
      version: '3.4.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 2. Analyze product listing (POST)
  app.post('/api/v1/analyze/product', (req: Request, res: Response) => {
    try {
      const productData = req.body as ProductListing;
      if (!productData || !productData.title) {
        return res.status(400).json({ error: 'Missing required product attributes.' });
      }

      // Ensure id exists
      if (!productData.id) {
        productData.id = `prod-${Date.now()}`;
      }

      const result = aegisDb.analyzeAndSave(productData, true);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Risk evaluation failed', details: err?.message });
    }
  });

  // 3. Get all analyses
  app.get('/api/v1/analyses', (req: Request, res: Response) => {
    const list = aegisDb.getAllAnalyses();
    res.json(list);
  });

  // 4. Get specific analysis by ID
  app.get('/api/v1/analyses/:id', (req: Request, res: Response) => {
    const item = aegisDb.getAnalysisById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    res.json(item);
  });

  // 5. Get product by ID
  app.get('/api/v1/products/:id', (req: Request, res: Response) => {
    const prod = aegisDb.getProductById(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Product listing not found.' });
    }
    res.json(prod);
  });

  // 6. Get product risk summary
  app.get('/api/v1/products/:id/risk', (req: Request, res: Response) => {
    const analysis = aegisDb.getLatestAnalysisForProduct(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Risk analysis not found for product.' });
    }
    res.json({
      productId: analysis.productId,
      overallScore: analysis.overallScore,
      riskLevel: analysis.riskLevel,
      verdict: analysis.verdict,
      confidence: analysis.confidence,
      indicators: analysis.indicators,
    });
  });

  // 7. Get reviews analysis for product
  app.get('/api/v1/products/:id/reviews', (req: Request, res: Response) => {
    const analysis = aegisDb.getLatestAnalysisForProduct(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }
    res.json(analysis.reviewIntel);
  });

  // 8. Get price history for product
  app.get('/api/v1/products/:id/price-history', (req: Request, res: Response) => {
    const analysis = aegisDb.getLatestAnalysisForProduct(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }
    res.json(analysis.priceIntel);
  });

  // 9. Dashboard metrics
  app.get('/api/v1/dashboard', (req: Request, res: Response) => {
    res.json(aegisDb.getDashboardStats());
  });

  // 10. Subscription & entitlements
  app.get('/api/v1/subscription', (req: Request, res: Response) => {
    res.json(aegisDb.getSubscription());
  });

  // 11. Site permissions
  app.get('/api/v1/site-permissions', (req: Request, res: Response) => {
    res.json(aegisDb.getPermissions());
  });

  app.post('/api/v1/site-permissions', (req: Request, res: Response) => {
    const { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required.' });
    }
    const newPerm = {
      id: `perm-${Date.now()}`,
      domain,
      grantedAt: new Date().toISOString(),
      status: 'ACTIVE' as const,
      autoScanEnabled: true,
      scannedCount: 0,
    };
    aegisDb.setPermission(newPerm);
    res.status(201).json(newPerm);
  });

  app.delete('/api/v1/site-permissions/:id', (req: Request, res: Response) => {
    const success = aegisDb.deletePermission(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Permission not found.' });
    }
    res.json({ message: 'Site permission revoked.' });
  });

  // 12. Model validation metrics
  app.get('/api/v1/model/metrics', (req: Request, res: Response) => {
    res.json(aegisDb.getModelMetrics());
  });

  // 13. Tracked Products API
  app.get('/api/v1/tracked-products', (req: Request, res: Response) => {
    res.json(aegisDb.getTrackedProducts());
  });

  app.post('/api/v1/tracked-products', (req: Request, res: Response) => {
    const product = req.body as ProductListing;
    if (!product || !product.id) {
      return res.status(400).json({ error: 'Product object with ID is required.' });
    }
    const tracked = aegisDb.trackProduct(product);
    res.status(201).json(tracked);
  });

  app.delete('/api/v1/tracked-products/:id', (req: Request, res: Response) => {
    const removed = aegisDb.untrackProduct(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Tracked product not found.' });
    }
    res.json({ message: 'Product removed from tracking watchlist.' });
  });

  app.post('/api/v1/tracked-products/:id/simulate-event', (req: Request, res: Response) => {
    const { eventType } = req.body as { eventType: 'PRICE_HIKE' | 'SELLER_RATING_DROP' | 'SURGE_AND_RATING_DROP' };
    const alert = aegisDb.simulateProductEvent(req.params.id, eventType || 'PRICE_HIKE');
    if (!alert) {
      return res.status(404).json({ error: 'Product not found for event simulation.' });
    }
    res.json({ message: 'Event simulated successfully', notification: alert });
  });

  // 14. Notifications API
  app.get('/api/v1/notifications', (req: Request, res: Response) => {
    res.json({
      notifications: aegisDb.getNotifications(),
      unreadCount: aegisDb.getUnreadNotificationsCount(),
    });
  });

  app.post('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
    const updated = aegisDb.markNotificationAsRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    res.json({ message: 'Notification marked as read.' });
  });

  app.post('/api/v1/notifications/mark-all-read', (req: Request, res: Response) => {
    aegisDb.markAllNotificationsAsRead();
    res.json({ message: 'All notifications marked as read.' });
  });

  app.delete('/api/v1/notifications/:id', (req: Request, res: Response) => {
    const cleared = aegisDb.clearNotification(req.params.id);
    if (!cleared) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    res.json({ message: 'Notification deleted.' });
  });

  // 15. Demo controls
  app.post('/api/v1/demo/reset', (req: Request, res: Response) => {
    aegisDb.resetDemoData();
    res.json({ message: 'Database reset successfully.' });
  });

  app.post('/api/v1/demo/preload', (req: Request, res: Response) => {
    aegisDb.preloadDemoData();
    res.json({ message: 'Demo scenarios preloaded.' });
  });

  // ========================================================
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ========================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AEGIS] Command Center & API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
