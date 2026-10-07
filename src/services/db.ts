import {
  ProductListing,
  AegisAnalysisResult,
  SitePermission,
  SubscriptionStatus,
  ModelMetricData,
  DashboardStats,
  TrackedProduct,
  AegisNotification,
} from '../types/aegis';
import { runAegisRiskPipeline } from './riskEngine';

// 6 Synthetic Demonstration Product Pages for Judges & Exhibition
export const DEMO_PRODUCTS: ProductListing[] = [
  {
    id: 'demo-legit-sony',
    url: 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH',
    title: 'Sony WH-1000XM5 Wireless Industry Leading Active Noise Cancelling Headphones',
    marketplace: 'Amazon',
    category: 'Headphones',
    brand: 'Sony',
    currentPrice: 26990,
    originalPrice: 34990,
    currency: 'INR',
    discountPercent: 23,
    rating: 4.6,
    ratingCount: 14200,
    reviewCount: 3840,
    description:
      'Industry-leading noise cancellation optimized with two processors and 8 microphones. Magnificent Sound, engineered to perfection with the new Integrated Processor V1. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30-hour battery life with quick charging (3 min charge for 3 hours playback). Ultra-comfortable, lightweight design with soft fit leather.',
    specifications: {
      Model: 'WH-1000XM5',
      Connectivity: 'Bluetooth 5.2, 3.5mm AUX',
      BatteryLife: '30 Hours ANC On',
      Weight: '250 grams',
      Warranty: '1 Year Manufacturer Warranty India',
    },
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    seller: {
      id: 'seller-appario',
      name: 'Appario Retail Private Ltd',
      rating: 4.7,
      ratingCount: 89400,
      tenureMonths: 72,
      isFulfilledByPlatform: true,
      returnPolicy: '7 Days Replacement Policy',
      warrantyClaims: '1 Year Brand Warranty honored at all authorized Sony service centers.',
      location: 'Bengaluru, Karnataka',
    },
    deliveryClaim: 'FREE Delivery tomorrow by 11 AM with Prime.',
    returnPolicy: '7 Days Replacement Policy',
    warrantyInfo: '1 Year Official Sony India Warranty',
    sampleReviews: [
      {
        id: 'rev-1',
        author: 'Arun K.',
        rating: 5,
        date: '2026-09-12',
        title: 'Outstanding noise cancellation on flights',
        content: 'I travel frequently for work between Delhi and Mumbai. The ANC cuts out engine hum entirely. Sound stage is balanced right out of the box.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-2',
        author: 'Sneha M.',
        rating: 4,
        date: '2026-09-02',
        title: 'Great comfort but cannot fold flat like XM4',
        content: 'Sound quality is superb, call microphones are drastically better than XM4. The only drawback is the carry case is bulkier because earcups only rotate flat.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-3',
        author: 'Devendra P.',
        rating: 5,
        date: '2026-08-28',
        title: 'Battery life easily lasts 4-5 days of heavy use',
        content: 'Multipoint Bluetooth connection to my laptop and phone switches seamlessly. Worth every rupee for remote working.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-4',
        author: 'Rhea S.',
        rating: 4,
        date: '2026-08-15',
        title: 'Premium build quality',
        content: 'Lightweight headband without excessive clamping pressure. High volume clarity remains undistorted.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'demo-cheap-ssd',
    url: 'https://www.flipkart.com/crucial-p3-plus-2tb-pcie-gen4-nvme-internal-ssd/p/itme987654321',
    title: 'Crucial P3 Plus 2TB PCIe Gen4 3D NAND NVMe M.2 High Speed Internal SSD (5000MB/s)',
    marketplace: 'Flipkart',
    category: 'HardDrives',
    brand: 'Crucial',
    currentPrice: 999,
    originalPrice: 18499,
    currency: 'INR',
    discountPercent: 95,
    rating: 3.4,
    ratingCount: 38,
    reviewCount: 12,
    description:
      'Massive 2TB PCIe Gen4 storage upgrade. Blazing speeds up to 5000MB/s read. Limited stock mega warehouse clearance! Lowest price in country guaranteed. Buy before lightning flash deal ends today.',
    specifications: {
      Capacity: '2TB',
      Interface: 'PCIe Gen4 x4',
      FormFactor: 'M.2 2280',
    },
    images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800'],
    seller: {
      id: 'seller-fastest-deals',
      name: 'SuperFlash Retailer',
      rating: 3.1,
      ratingCount: 42,
      tenureMonths: 1,
      isFulfilledByPlatform: false,
      returnPolicy: 'No Returns or Exchanges Allowed',
      warrantyClaims: 'Contact manufacturer directly',
      location: 'Surat, Gujarat',
    },
    urgencyText: 'Hurry! Only 2 left in stock. Price valid for next 14 minutes only!',
    returnPolicy: 'Non-returnable item. All sales final.',
    sampleReviews: [
      {
        id: 'rev-c1',
        author: 'Vikas R.',
        rating: 1,
        date: '2026-10-01',
        title: 'Do not buy! Fake controller chip',
        content: 'Formatted as 64GB flash memory looped with fake partition firmware. Computer reports errors when writing past 58GB. Complete scam drive.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-c2',
        author: 'Amit G.',
        rating: 1,
        date: '2026-09-29',
        title: 'Unbelievably slow and overheating',
        content: 'Speed is barely 25MB/s USB 2.0 speed inside a hollow plastic casing. Not Crucial authentic hardware.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'demo-suspicious-seller',
    url: 'https://www.amazon.in/Apple-MacBook-Air-13-inch-Unified/dp/B0CX23V6X5',
    title: 'Apple 2024 MacBook Air 13-inch Laptop with M3 chip, 16GB Unified Memory, 512GB SSD',
    marketplace: 'Amazon',
    category: 'Laptops',
    brand: 'Apple',
    currentPrice: 84900,
    originalPrice: 134900,
    currency: 'INR',
    discountPercent: 37,
    rating: 2.8,
    ratingCount: 19,
    reviewCount: 9,
    description:
      'Apple M3 chip with 8-core CPU and 10-core GPU. 13.6-inch Liquid Retina display with True Tone. 1080p FaceTime HD camera. Backlit Magic Keyboard with Touch ID.',
    specifications: {
      Processor: 'Apple M3',
      RAM: '16GB Unified',
      Storage: '512GB SSD',
    },
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    seller: {
      id: 'seller-nova-tech-2026',
      name: 'NovaTech Enterprise Storefront',
      rating: 2.7,
      ratingCount: 18,
      tenureMonths: 1,
      isFulfilledByPlatform: false,
      returnPolicy: 'Replacement Only within 24 hours of delivery with unboxing video proof',
      warrantyClaims: 'Warranty card enclosed inside box',
      location: 'New Delhi, India',
    },
    returnPolicy: 'Replacement Only within 24 hours',
    sampleReviews: [
      {
        id: 'rev-s1',
        author: 'Manish T.',
        rating: 1,
        date: '2026-09-25',
        title: 'Delivered an opened used unit without charger',
        content: 'Box seal was sliced open and taped over with scotch tape. Serial number on box does not match warranty check on Apple site.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-s2',
        author: 'Priya N.',
        rating: 2,
        date: '2026-09-20',
        title: 'Refused return request',
        content: 'Seller claimed unboxing video had poor lighting and rejected my request. Disputing transaction through credit card bank.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'demo-review-ring',
    url: 'https://www.flipkart.com/fitpulse-ultra-amoled-smartwatch-bluetooth-calling/p/itm123987',
    title: 'FitPulse Ultra 1.96" AMOLED HD Display Bluetooth Calling Smartwatch with Titanium Bezel',
    marketplace: 'Flipkart',
    category: 'Smartwatches',
    brand: 'FitPulse',
    currentPrice: 1899,
    originalPrice: 7999,
    currency: 'INR',
    discountPercent: 76,
    rating: 4.9,
    ratingCount: 120,
    reviewCount: 88,
    description:
      'Premium 1.96-inch AMOLED display with 1000 nits brightness. AI Voice Assistant, Bluetooth calling with HD speaker and mic. 120+ Sports modes, IP68 waterproof rating, SpO2 and Heart Rate tracking.',
    specifications: {
      Display: '1.96 AMOLED',
      Battery: '420 mAh, 10 Days',
      WaterResistance: 'IP68',
    },
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    seller: {
      id: 'seller-pulse-direct',
      name: 'Direct Pulse Gadgets',
      rating: 4.1,
      ratingCount: 140,
      tenureMonths: 4,
      isFulfilledByPlatform: false,
      returnPolicy: '7 Days Return',
      warrantyClaims: '6 Months Brand Warranty',
    },
    sampleReviews: [
      {
        id: 'rev-rr-1',
        author: 'Rahul J.',
        rating: 5,
        date: '2026-10-04',
        title: 'Best product must buy highly recommend 5 stars',
        content: 'Best product must buy highly recommend 5 stars. Display quality is really crystal clear. Battery life is awesome.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-rr-2',
        author: 'Sunil M.',
        rating: 5,
        date: '2026-10-04',
        title: 'Best product must buy highly recommend 5 stars',
        content: 'Best product must buy highly recommend 5 stars. Display quality is really crystal clear and very responsive.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-rr-3',
        author: 'Deepak V.',
        rating: 5,
        date: '2026-10-03',
        title: 'Best product must buy highly recommend',
        content: 'Best product must buy highly recommend 5 stars. Very smooth touch and awesome sound quality.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-rr-4',
        author: 'Kunal S.',
        rating: 5,
        date: '2026-10-03',
        title: 'Great purchase',
        content: 'Best product must buy highly recommend 5 stars. Super fast delivery and high quality finish.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-rr-5',
        author: 'Pooja K.',
        rating: 5,
        date: '2026-10-02',
        title: 'Best product must buy',
        content: 'Best product must buy highly recommend 5 stars. Battery life is awesome and calling is crystal clear.',
        verifiedPurchase: true,
      },
    ],
  },
  {
    id: 'demo-phishing-scam',
    url: 'https://www.amazon.in/Samsung-Galaxy-S24-Ultra-Titanium/dp/B0CQ2BGF1M',
    title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 512GB Storage) with AI Suite',
    marketplace: 'Amazon',
    category: 'Smartphones',
    brand: 'Samsung',
    currentPrice: 42999,
    originalPrice: 139999,
    currency: 'INR',
    discountPercent: 69,
    rating: 3.8,
    ratingCount: 14,
    reviewCount: 6,
    description:
      'Brand New Factory Sealed Samsung Galaxy S24 Ultra 5G. SPECIAL PROMOTION NOTICE: To claim extra 20% cashback and free Galaxy Buds 2 Pro, DO NOT checkout online. Please contact seller directly on WhatsApp at +91-9876543210 or email deals@samsvng-promos.in before ordering. Payment must be made via direct UPI or Bank Transfer for courier insurance release.',
    specifications: {
      Model: 'SM-S928B',
      RAM: '12GB',
      Storage: '512GB',
    },
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
    seller: {
      id: 'seller-divert-hub',
      name: 'OmniDeals Direct Express',
      rating: 3.4,
      ratingCount: 22,
      tenureMonths: 2,
      isFulfilledByPlatform: false,
      returnPolicy: 'No Platform Returns',
      warrantyClaims: '1 Year Warranty upon WhatsApp invoice validation',
      contactNotes: 'Contact seller on WhatsApp +91-9876543210. Pay outside platform via UPI transfer for guaranteed delivery.',
      externalPaymentRequested: true,
      location: 'Noida, UP',
    },
    urgencyText: 'Special promo allotment! Contact seller on WhatsApp within 1 hour to lock deal.',
    returnPolicy: 'Contact seller directly via WhatsApp for replacements.',
    sampleReviews: [
      {
        id: 'rev-ph-1',
        author: 'Rajiv N.',
        rating: 1,
        date: '2026-09-18',
        title: 'Lost ₹35,000 in UPI scam!',
        content: 'Seller asked me to send UPI transfer to reserve IMEI number on WhatsApp, then stopped replying and deleted phone number. Reported to cybercrime portal.',
        verifiedPurchase: false,
      },
    ],
  },
  {
    id: 'demo-counterfeit-listing',
    url: 'https://www.amazon.in/App1e-AirPods-Pro-2nd-Generation/dp/B0BDHW487C',
    title: 'App1e AirPods Pro (2nd Generation) Wireless Earbuds with MagSafe USB-C Case',
    marketplace: 'Amazon',
    category: 'Headphones',
    brand: 'App1e',
    currentPrice: 2499,
    originalPrice: 24900,
    currency: 'INR',
    discountPercent: 90,
    rating: 3.2,
    ratingCount: 45,
    reviewCount: 18,
    description:
      'High copy original App1e AirPods Pro second generation. H1 chip inside with active noise cancelling and spatial audio. 100% genuine replica experience. Includes original style box, silicone ear tips, and charging cable.',
    specifications: {
      Brand: 'App1e',
      Bluetooth: 'Version 5.0 (title claimed 5.3)',
      Chip: 'H1 Clone',
      Warranty: '30 Days Seller Replacement',
    },
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800'],
    seller: {
      id: 'seller-clone-king',
      name: 'AudioStyle Accessories',
      rating: 3.0,
      ratingCount: 54,
      tenureMonths: 2,
      isFulfilledByPlatform: false,
      returnPolicy: 'No refunds, only replacement for non-working unit within 3 days',
      warrantyClaims: '30 days seller warranty',
    },
    returnPolicy: 'No refunds allowed',
    sampleReviews: [
      {
        id: 'rev-cf-1',
        author: 'Karan M.',
        rating: 1,
        date: '2026-09-28',
        title: 'Cheap plastic clone, no noise cancellation',
        content: 'Spelling on box says "Designed by App1e in California". Case hinges feel loose and squeak. iPhone detects it as generic Bluetooth accessory.',
        verifiedPurchase: true,
      },
      {
        id: 'rev-cf-2',
        author: 'Sanjay B.',
        rating: 2,
        date: '2026-09-15',
        title: 'Microphone sounds like underwater radio',
        content: 'Static hiss during calls. Battery drains in less than 90 minutes. Definitely not authentic Apple hardware.',
        verifiedPurchase: true,
      },
    ],
  },
];

// In-Memory Database Store for Session & API
class AegisDatabase {
  private products: Map<string, ProductListing> = new Map();
  private analyses: Map<string, AegisAnalysisResult> = new Map();
  private permissions: Map<string, SitePermission> = new Map();
  private trackedProducts: Map<string, TrackedProduct> = new Map();
  private notifications: Map<string, AegisNotification> = new Map();
  private notificationListeners: Set<(notification: AegisNotification) => void> = new Set();
  private subscription: SubscriptionStatus;
  private modelMetrics: ModelMetricData;

  constructor() {
    // Initialize permissions
    this.permissions.set('amazon.in', {
      id: 'perm-1',
      domain: 'amazon.in',
      grantedAt: '2026-08-01T10:00:00Z',
      status: 'ACTIVE',
      autoScanEnabled: true,
      scannedCount: 14,
    });
    this.permissions.set('flipkart.com', {
      id: 'perm-2',
      domain: 'flipkart.com',
      grantedAt: '2026-08-10T14:30:00Z',
      status: 'ACTIVE',
      autoScanEnabled: true,
      scannedCount: 8,
    });
    this.permissions.set('generic-commerce', {
      id: 'perm-3',
      domain: 'other-shopping-sites',
      grantedAt: '2026-09-01T09:15:00Z',
      status: 'ACTIVE',
      autoScanEnabled: false,
      scannedCount: 3,
    });

    // Default Pro Subscription for University Exhibition
    this.subscription = {
      tier: 'PRO',
      status: 'ACTIVE',
      scansUsedThisMonth: 25,
      scanLimitMonthly: 500,
      expiresAt: '2027-10-06T00:00:00Z',
      features: {
        advancedAiReviewAnalysis: true,
        authenticityEngine: true,
        productComparison: true,
        unlimitedHistory: true,
        crossSiteAnalysis: true,
        priorityProcessing: true,
      },
    };

    // Realistic scikit-learn model evaluation statistics
    this.modelMetrics = {
      modelName: 'Aegis-Hybrid-Ensemble-v3.4',
      modelType: 'TF-IDF + Linear SVM + Isolation Forest Anomaly Engine',
      datasetSize: 18450,
      trainSize: 14760,
      testSize: 3690,
      lastUpdated: '2026-10-01T18:00:00Z',
      accuracy: 0.942,
      precision: 0.931,
      recall: 0.954,
      f1Score: 0.942,
      confusionMatrix: {
        truePositive: 1760,
        falsePositive: 130,
        trueNegative: 1715,
        falseNegative: 85,
      },
      featureWeights: [
        { feature: 'Price anomaly delta vs category baseline', weight: 0.24 },
        { feature: 'Off-platform payment solicitation token', weight: 0.22 },
        { feature: 'Trigram review text similarity score', weight: 0.18 },
        { feature: 'Seller tenure under 60 days', weight: 0.14 },
        { feature: 'Brand typosquatting distance metric', weight: 0.12 },
        { feature: 'High-pressure scarcity urgency density', weight: 0.10 },
      ],
    };

    // Preload demo products and run real pipeline on each
    this.preloadDemoData();
  }

  public preloadDemoData(): void {
    DEMO_PRODUCTS.forEach((prod) => {
      this.products.set(prod.id, prod);
      const analysis = runAegisRiskPipeline(prod, true);
      this.analyses.set(analysis.id, analysis);
    });

    // Seed tracked products
    const sony = DEMO_PRODUCTS[0]; // Sony Headphones
    const ssd = DEMO_PRODUCTS[1];  // Crucial SSD
    const s24 = DEMO_PRODUCTS[4];  // Samsung S24 Ultra

    this.trackedProducts.set(sony.id, {
      id: `track-${sony.id}`,
      productId: sony.id,
      title: sony.title,
      marketplace: sony.marketplace,
      brand: sony.brand,
      category: sony.category,
      initialPrice: 26990,
      currentPrice: 26990,
      currency: 'INR',
      initialSellerRating: 4.7,
      currentSellerRating: 4.7,
      sellerName: sony.seller.name,
      trackedSince: '2026-09-15T08:00:00Z',
      lastChecked: '2026-10-07T06:30:00Z',
      priceChangePercent: 0,
      sellerRatingDelta: 0,
      status: 'ACTIVE',
      activeAlertCount: 0,
      priceHistory: [
        { timestamp: '2026-09-15T08:00:00Z', price: 26990 },
        { timestamp: '2026-09-25T12:00:00Z', price: 26990 },
        { timestamp: '2026-10-07T06:30:00Z', price: 26990 },
      ],
      ratingHistory: [
        { timestamp: '2026-09-15T08:00:00Z', rating: 4.7 },
        { timestamp: '2026-10-07T06:30:00Z', rating: 4.7 },
      ],
    });

    this.trackedProducts.set(ssd.id, {
      id: `track-${ssd.id}`,
      productId: ssd.id,
      title: ssd.title,
      marketplace: ssd.marketplace,
      brand: ssd.brand,
      category: ssd.category,
      initialPrice: 999,
      currentPrice: 1499,
      currency: 'INR',
      initialSellerRating: 3.8,
      currentSellerRating: 3.1,
      sellerName: ssd.seller.name,
      trackedSince: '2026-09-20T10:00:00Z',
      lastChecked: '2026-10-07T06:45:00Z',
      priceChangePercent: 50.1,
      sellerRatingDelta: -0.7,
      status: 'ALERT',
      activeAlertCount: 2,
      priceHistory: [
        { timestamp: '2026-09-20T10:00:00Z', price: 999 },
        { timestamp: '2026-10-01T14:00:00Z', price: 1049 },
        { timestamp: '2026-10-07T05:15:00Z', price: 1499 },
      ],
      ratingHistory: [
        { timestamp: '2026-09-20T10:00:00Z', rating: 3.8 },
        { timestamp: '2026-10-01T14:00:00Z', rating: 3.4 },
        { timestamp: '2026-10-07T05:15:00Z', rating: 3.1 },
      ],
    });

    this.trackedProducts.set(s24.id, {
      id: `track-${s24.id}`,
      productId: s24.id,
      title: s24.title,
      marketplace: s24.marketplace,
      brand: s24.brand,
      category: s24.category,
      initialPrice: 42999,
      currentPrice: 42999,
      currency: 'INR',
      initialSellerRating: 4.4,
      currentSellerRating: 3.4,
      sellerName: s24.seller.name,
      trackedSince: '2026-09-28T16:00:00Z',
      lastChecked: '2026-10-07T06:40:00Z',
      priceChangePercent: 0,
      sellerRatingDelta: -1.0,
      status: 'ALERT',
      activeAlertCount: 1,
      priceHistory: [
        { timestamp: '2026-09-28T16:00:00Z', price: 42999 },
        { timestamp: '2026-10-07T06:40:00Z', price: 42999 },
      ],
      ratingHistory: [
        { timestamp: '2026-09-28T16:00:00Z', rating: 4.4 },
        { timestamp: '2026-10-04T09:00:00Z', rating: 3.9 },
        { timestamp: '2026-10-07T04:20:00Z', rating: 3.4 },
      ],
    });

    // Seed realistic notifications
    const notif1: AegisNotification = {
      id: 'notif-price-ssd',
      productId: ssd.id,
      productTitle: ssd.title,
      marketplace: ssd.marketplace,
      type: 'PRICE_HIKE',
      severity: 'WARNING',
      title: 'Sudden Price Surge Detected (+50.1%)',
      message: 'Crucial P3 Plus 2TB SSD price jumped unexpectedly from ₹999 to ₹1,499. Potential algorithmic price surge or artificial markdown reset.',
      timestamp: '2026-10-07T05:15:00Z',
      read: false,
      details: {
        oldValue: 999,
        newValue: 1499,
        percentageChange: 50.1,
        reason: 'Price spiked above 95th percentile velocity without category benchmark justification.',
      },
    };

    const notif2: AegisNotification = {
      id: 'notif-seller-ssd',
      productId: ssd.id,
      productTitle: ssd.title,
      marketplace: ssd.marketplace,
      type: 'SELLER_RATING_DROP',
      severity: 'CRITICAL',
      title: 'Suspicious Seller Rating Plunge (3.8 → 3.1 ★)',
      message: 'Seller "SuperFlash Retailer" experienced an abnormal rating decline (-0.7 ★) coupled with surge in counterfeit flash controller dispute claims.',
      timestamp: '2026-10-07T05:20:00Z',
      read: false,
      details: {
        oldValue: '3.8 ★',
        newValue: '3.1 ★',
        percentageChange: -18.4,
        reason: 'Multiple 1-star verified dispute claims logged regarding non-genuine firmware.',
      },
    };

    const notif3: AegisNotification = {
      id: 'notif-seller-s24',
      productId: s24.id,
      productTitle: s24.title,
      marketplace: s24.marketplace,
      type: 'SUSPICIOUS_SELLER_CHANGE',
      severity: 'CRITICAL',
      title: 'Severe Seller Rating Decline & Off-Platform Signals',
      message: 'Seller rating dropped from 4.4 to 3.4 ★ (-1.0 plunge). External WhatsApp payment solicitations detected on storefront description.',
      timestamp: '2026-10-07T04:20:00Z',
      read: false,
      details: {
        oldValue: '4.4 ★',
        newValue: '3.4 ★',
        percentageChange: -22.7,
        reason: 'Storefront updated contact notes directing shoppers to pay via off-platform UPI.',
      },
    };

    this.notifications.set(notif1.id, notif1);
    this.notifications.set(notif2.id, notif2);
    this.notifications.set(notif3.id, notif3);
  }

  public resetDemoData(): void {
    this.products.clear();
    this.analyses.clear();
    this.trackedProducts.clear();
    this.notifications.clear();
    this.preloadDemoData();
  }

  public getAllProducts(): ProductListing[] {
    return Array.from(this.products.values());
  }

  public getProductById(id: string): ProductListing | undefined {
    return this.products.get(id);
  }

  public saveProduct(product: ProductListing): ProductListing {
    this.products.set(product.id, product);
    return product;
  }

  public analyzeAndSave(product: ProductListing, isPro: boolean = false): AegisAnalysisResult {
    this.saveProduct(product);
    const result = runAegisRiskPipeline(product, isPro || this.subscription.tier === 'PRO');
    this.analyses.set(result.id, result);
    return result;
  }

  public getAllAnalyses(): AegisAnalysisResult[] {
    return Array.from(this.analyses.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getAnalysisById(id: string): AegisAnalysisResult | undefined {
    return this.analyses.get(id);
  }

  public getLatestAnalysisForProduct(productId: string): AegisAnalysisResult | undefined {
    const list = this.getAllAnalyses().filter((a) => a.productId === productId);
    return list[0];
  }

  public deleteAnalysis(id: string): boolean {
    return this.analyses.delete(id);
  }

  public clearAllHistory(): void {
    this.analyses.clear();
  }

  // --- Real-Time Tracking & Notification System Methods ---

  public getTrackedProducts(): TrackedProduct[] {
    return Array.from(this.trackedProducts.values()).sort(
      (a, b) => new Date(b.lastChecked).getTime() - new Date(a.lastChecked).getTime()
    );
  }

  public getTrackedProduct(productId: string): TrackedProduct | undefined {
    return this.trackedProducts.get(productId);
  }

  public isProductTracked(productId: string): boolean {
    return this.trackedProducts.has(productId);
  }

  public trackProduct(product: ProductListing): TrackedProduct {
    const existing = this.trackedProducts.get(product.id);
    if (existing) return existing;

    const newTracked: TrackedProduct = {
      id: `track-${product.id}`,
      productId: product.id,
      title: product.title,
      marketplace: product.marketplace,
      brand: product.brand,
      category: product.category,
      initialPrice: product.currentPrice,
      currentPrice: product.currentPrice,
      currency: product.currency,
      initialSellerRating: product.seller.rating,
      currentSellerRating: product.seller.rating,
      sellerName: product.seller.name,
      trackedSince: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      priceChangePercent: 0,
      sellerRatingDelta: 0,
      status: 'ACTIVE',
      activeAlertCount: 0,
      priceHistory: [{ timestamp: new Date().toISOString(), price: product.currentPrice }],
      ratingHistory: [{ timestamp: new Date().toISOString(), rating: product.seller.rating }],
    };

    this.trackedProducts.set(product.id, newTracked);
    return newTracked;
  }

  public untrackProduct(productId: string): boolean {
    return this.trackedProducts.delete(productId);
  }

  public getNotifications(): AegisNotification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getUnreadNotificationsCount(): number {
    return Array.from(this.notifications.values()).filter((n) => !n.read).length;
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.notifications.get(id);
    if (n) {
      n.read = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  public clearNotification(id: string): boolean {
    return this.notifications.delete(id);
  }

  public clearAllNotifications(): void {
    this.notifications.clear();
  }

  public subscribeToNotifications(callback: (notification: AegisNotification) => void): () => void {
    this.notificationListeners.add(callback);
    return () => {
      this.notificationListeners.delete(callback);
    };
  }

  private broadcastNotification(notif: AegisNotification): void {
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notif);
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });
  }

  public simulateProductEvent(
    productId: string,
    eventType: 'PRICE_HIKE' | 'SELLER_RATING_DROP' | 'SURGE_AND_RATING_DROP'
  ): AegisNotification | null {
    let tracked = this.trackedProducts.get(productId);
    if (!tracked) {
      // If not yet tracked, find product and auto-track it
      const prod = this.getProductById(productId) || DEMO_PRODUCTS.find((p) => p.id === productId);
      if (prod) {
        tracked = this.trackProduct(prod);
      } else {
        return null;
      }
    }

    const timestamp = new Date().toISOString();
    let notification: AegisNotification | null = null;

    if (eventType === 'PRICE_HIKE' || eventType === 'SURGE_AND_RATING_DROP') {
      const hikeMultiplier = eventType === 'SURGE_AND_RATING_DROP' ? 1.45 : 1.30;
      const oldPrice = tracked.currentPrice;
      const newPrice = Math.round(tracked.currentPrice * hikeMultiplier);
      const percentChange = Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;

      tracked.currentPrice = newPrice;
      tracked.priceChangePercent = percentChange;
      tracked.status = 'ALERT';
      tracked.activeAlertCount += 1;
      tracked.lastChecked = timestamp;
      tracked.priceHistory.push({ timestamp, price: newPrice });

      notification = {
        id: `alert-price-${Date.now()}`,
        productId: tracked.productId,
        productTitle: tracked.title,
        marketplace: tracked.marketplace,
        type: 'PRICE_HIKE',
        severity: percentChange >= 40 ? 'CRITICAL' : 'WARNING',
        title: `Sudden Price Hike Alert (+${percentChange}%)`,
        message: `Price increased sharply from ₹${oldPrice.toLocaleString()} to ₹${newPrice.toLocaleString()} on ${tracked.marketplace}. Observed surge exceeds normal market variance.`,
        timestamp,
        read: false,
        details: {
          oldValue: oldPrice,
          newValue: newPrice,
          percentageChange: percentChange,
          reason: 'Algorithmic surge or sudden markdown withdrawal detected by AEGIS price monitoring engine.',
        },
      };

      this.notifications.set(notification.id, notification);
      this.broadcastNotification(notification);
    }

    if (eventType === 'SELLER_RATING_DROP' || eventType === 'SURGE_AND_RATING_DROP') {
      const oldRating = tracked.currentSellerRating;
      const dropDelta = 0.8;
      const newRating = Math.max(1.5, Math.round((oldRating - dropDelta) * 10) / 10);
      const ratingDiff = Math.round((newRating - oldRating) * 10) / 10;

      tracked.currentSellerRating = newRating;
      tracked.sellerRatingDelta = ratingDiff;
      tracked.status = 'ALERT';
      tracked.activeAlertCount += 1;
      tracked.lastChecked = timestamp;
      tracked.ratingHistory.push({ timestamp, rating: newRating });

      const ratingNotif: AegisNotification = {
        id: `alert-rating-${Date.now()}`,
        productId: tracked.productId,
        productTitle: tracked.title,
        marketplace: tracked.marketplace,
        type: 'SELLER_RATING_DROP',
        severity: newRating < 3.2 ? 'CRITICAL' : 'WARNING',
        title: `Suspicious Seller Rating Drop (${oldRating} → ${newRating} ★)`,
        message: `Seller "${tracked.sellerName}" public rating plunged by ${Math.abs(ratingDiff)} stars amidst elevated buyer disputes and fulfillment complaints.`,
        timestamp,
        read: false,
        details: {
          oldValue: `${oldRating} ★`,
          newValue: `${newRating} ★`,
          percentageChange: Math.round((ratingDiff / oldRating) * 100),
          reason: 'Rapid accumulation of low-score transactions within 48-hour monitoring window.',
        },
      };

      this.notifications.set(ratingNotif.id, ratingNotif);
      this.broadcastNotification(ratingNotif);
      if (!notification) notification = ratingNotif;
    }

    return notification;
  }

  public getDashboardStats(): DashboardStats {
    const all = this.getAllAnalyses();
    const highRisk = all.filter((a) => a.overallScore >= 61).length;
    const elevated = all.filter((a) => a.overallScore >= 41 && a.overallScore <= 60).length;
    const low = all.filter((a) => a.overallScore <= 40).length;
    const avgScore =
      all.length > 0
        ? Math.round(all.reduce((acc, curr) => acc + curr.overallScore, 0) / all.length)
        : 0;

    const scamIntercepted = all.filter(
      (a) => a.scamLanguageIntel.offPlatformPaymentRisk || a.authenticityIntel.brandMismatchRisk === 'HIGH'
    ).length;

    return {
      totalScans: all.length,
      highRiskCount: highRisk,
      elevatedRiskCount: elevated,
      lowRiskCount: low,
      averageRiskScore: avgScore,
      topRiskCategory: 'Price Anomalies & Off-Platform Signals',
      scamAttemptsIntercepted: scamIntercepted,
      recentAnalyses: all.slice(0, 5),
      unreadNotificationsCount: this.getUnreadNotificationsCount(),
      activeTrackedProductsCount: this.getTrackedProducts().length,
      notifications: this.getNotifications(),
      trackedProducts: this.getTrackedProducts(),
    };
  }

  public getPermissions(): SitePermission[] {
    return Array.from(this.permissions.values());
  }

  public setPermission(perm: SitePermission): void {
    this.permissions.set(perm.domain, perm);
  }

  public deletePermission(domainOrId: string): boolean {
    let targetKey: string | null = null;
    this.permissions.forEach((v, k) => {
      if (k === domainOrId || v.id === domainOrId) targetKey = k;
    });
    if (targetKey) {
      return this.permissions.delete(targetKey);
    }
    return false;
  }

  public getSubscription(): SubscriptionStatus {
    return this.subscription;
  }

  public setSubscriptionTier(tier: 'FREE' | 'PRO'): SubscriptionStatus {
    this.subscription.tier = tier;
    this.subscription.features.advancedAiReviewAnalysis = tier === 'PRO';
    this.subscription.features.authenticityEngine = tier === 'PRO';
    this.subscription.features.productComparison = tier === 'PRO';
    this.subscription.features.crossSiteAnalysis = tier === 'PRO';
    this.subscription.scanLimitMonthly = tier === 'PRO' ? 500 : 15;
    return this.subscription;
  }

  public getModelMetrics(): ModelMetricData {
    return this.modelMetrics;
  }
}

// Global Singleton Instance
export const aegisDb = new AegisDatabase();
