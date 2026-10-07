# AEGIS REST API Specification (v1)

Base URL: `http://localhost:3000/api/v1` (or Python FastAPI on `http://localhost:8000/api/v1`)

## Endpoints

### 1. Health Check
- **Route**: `GET /api/v1/health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "AEGIS Commerce Risk Engine",
  "version": "3.4.0",
  "timestamp": "2026-10-06T12:00:00Z"
}
```

### 2. Analyze Product Listing
- **Route**: `POST /api/v1/analyze/product`
- **Payload**: `ProductListing` JSON object (title, price, seller, reviews, urgency)
- **Response**: `AegisAnalysisResult` JSON object (overallScore, riskLevel, verdict, confidence, indicators, explanations, recommendations)

### 3. Retrieve Historical Analyses
- **Route**: `GET /api/v1/analyses`
- **Response**: Array of `AegisAnalysisResult` objects.

### 4. Retrieve Single Analysis
- **Route**: `GET /api/v1/analyses/:id`
- **Response**: `AegisAnalysisResult` object.

### 5. Product Risk Summary
- **Route**: `GET /api/v1/products/:id/risk`
- **Response**: Score, risk level, verdict, and indicators.

### 6. Review Intelligence Signals
- **Route**: `GET /api/v1/products/:id/reviews`
- **Response**: Duplicate phrase ratio, sentiment dissonance count, findings.

### 7. Price Anomaly History
- **Route**: `GET /api/v1/products/:id/price-history`
- **Response**: Baseline comparison, discount rate, historical bounds.

### 8. Dashboard Telemetry
- **Route**: `GET /api/v1/dashboard`
- **Response**: Total scans, risk distribution, threats intercepted.

### 9. Subscription Entitlements
- **Route**: `GET /api/v1/subscription`
- **Response**: Current plan tier (`FREE` | `PRO`), monthly limits, feature flags.

### 10. Site Permissions
- **Route**: `GET /api/v1/site-permissions`
- **Route**: `POST /api/v1/site-permissions` (Body: `{ "domain": "domain.com" }`)
- **Route**: `DELETE /api/v1/site-permissions/:id`

### 11. Real-Time Tracked Products Watchlist
- **Route**: `GET /api/v1/tracked-products`
- **Route**: `POST /api/v1/tracked-products` (Body: `ProductListing` JSON)
- **Route**: `DELETE /api/v1/tracked-products/:id`
- **Route**: `POST /api/v1/tracked-products/:id/simulate-event` (Body: `{ "eventType": "PRICE_HIKE" | "SELLER_RATING_DROP" | "SURGE_AND_RATING_DROP" }`)

### 12. Real-Time Threat Notifications
- **Route**: `GET /api/v1/notifications`
- **Response**: Array of `AegisNotification` objects and `unreadCount`.
- **Route**: `POST /api/v1/notifications/:id/read`
- **Route**: `POST /api/v1/notifications/mark-all-read`
- **Route**: `DELETE /api/v1/notifications/:id`
