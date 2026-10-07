# AEGIS Architecture & System Design

## 1. High-Level System Flow

```
[ Web Page (Amazon / Flipkart) ]
               │
               ▼
   [ Content Script / Site Adapter ]
               │ (Extracts visible DOM schema: price, seller, reviews)
               ▼
   [ Client-Side Permission Gate ]
               │ (Explicit user consent check)
               ▼
   [ AEGIS REST API (server.ts / FastAPI) ]
               │
   ┌───────────┴────────────────────────┐
   │        Hybrid Threat Engine        │
   │                                    │
   │  ├─ Price Anomaly Detector         │
   │  ├─ Seller Risk Scorer             │
   │  ├─ Trigram Review Similarity      │
   │  ├─ NLP Description Classifier     │
   │  ├─ Authenticity / Typosquatting   │
   │  └─ Scam Language Traps            │
   └───────────┬────────────────────────┘
               │
               ▼
   [ Explainability & Weighted Risk Synthesis ]
               │
               ▼
   [ 3D AEGIS Core (Three.js WebGL Canvas) ]
               │
   [ Floating In-Page Overlay / Dashboard ]
```

## 2. Multi-Layer Scoring Model

The Overall AEGIS Risk Score is bounded between **0 and 100**:

$$\text{Risk Score} = 0.22 S_{\text{price}} + 0.22 S_{\text{seller}} + 0.18 S_{\text{review}} + 0.14 S_{\text{desc}} + 0.14 S_{\text{auth}} + 0.10 S_{\text{scam}}$$

- **0–20**: LOW RISK (Safe baselines, established tenure, natural reviews)
- **21–40**: MODERATE RISK (Mild discounts, normal variation)
- **41–60**: ELEVATED RISK (New seller or unusual discount)
- **61–80**: HIGH RISK (Major price discrepancy or duplicated reviews)
- **81–100**: CRITICAL RISK (Off-platform payment diversion, WhatsApp phishing, non-returnable trap)

*Critical Override*: If an off-platform payment attempt or WhatsApp order diversion is detected, the score is automatically escalated to a minimum of 78/100 (HIGH/CRITICAL).

## 3. Site Adapter Architecture

All extraction logic is decoupled from core risk logic via `ISiteAdapter`:
- `AmazonAdapter`: Targeted selectors (`#productTitle`, `#acrCustomerReviewText`, `#merchant-info`).
- `FlipkartAdapter`: Targeted selectors (`span.B_NuCI`, `div._30jeq3`, `div._27M-vq`).
- `GenericCommerceAdapter`: Standardized OpenGraph and Schema.org `product:price:amount` extraction.
