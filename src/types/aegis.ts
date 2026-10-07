export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type AegisVerdict =
  | 'LOOKS REASONABLE'
  | 'PROCEED WITH CAUTION'
  | 'HIGH RISK'
  | 'AVOID / VERIFY FIRST';

export interface ProductListing {
  id: string;
  url: string;
  title: string;
  marketplace: 'Amazon' | 'Flipkart' | 'Generic';
  category: string;
  brand: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  seller: SellerInfo;
  sampleReviews: ReviewItem[];
  deliveryClaim?: string;
  returnPolicy?: string;
  warrantyInfo?: string;
  urgencyText?: string;
  rawText?: string;
}

export interface SellerInfo {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  tenureMonths: number;
  isFulfilledByPlatform: boolean;
  returnPolicy: string;
  warrantyClaims: string;
  contactNotes?: string;
  externalPaymentRequested?: boolean;
  location?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verifiedPurchase: boolean;
}

export interface DetectedIndicator {
  id: string;
  category: 'PRICE' | 'SELLER' | 'REVIEW' | 'DESCRIPTION' | 'AUTHENTICITY' | 'SCAM_LANGUAGE';
  severity: 'INFO' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  evidence: string;
  weight: number;
}

export interface PriceIntelligence {
  score: number; // 0-100 (higher = riskier)
  isAnomaly: boolean;
  discountPercent: number;
  observedBaselinePrice: number;
  priceDropRate: number;
  findings: string[];
  historicalRange?: { min: number; max: number; avg: number };
}

export interface SellerIntelligence {
  score: number; // 0-100 (higher = riskier)
  sellerRating: number;
  reviewCount: number;
  tenureMonths: number;
  fulfilledByPlatform: boolean;
  returnPolicyRisk: 'LOW' | 'MODERATE' | 'HIGH';
  findings: string[];
}

export interface ReviewIntelligence {
  score: number; // 0-100 (higher = riskier)
  sampledCount: number;
  duplicatePhrasePercent: number;
  sentimentDissonanceCount: number;
  burstSignalDetected: boolean;
  findings: string[];
  representativePhrases: string[];
}

export interface DescriptionIntelligence {
  score: number; // 0-100 (higher = riskier)
  urgencyLevel: 'NONE' | 'MODERATE' | 'AGGRESSIVE';
  unrealisticGuaranteesDetected: boolean;
  specContradictionsFound: string[];
  missingCrucialSpecs: string[];
  findings: string[];
}

export interface AuthenticityIntelligence {
  score: number; // 0-100 (higher = riskier)
  brandMismatchRisk: 'LOW' | 'ELEVATED' | 'HIGH';
  sellerAuthorizationStatus: 'VERIFIED' | 'UNVERIFIED' | 'SUSPICIOUS';
  findings: string[];
}

export interface ScamLanguageIntelligence {
  score: number; // 0-100 (higher = riskier)
  detectedKeywords: string[];
  offPlatformPaymentRisk: boolean;
  findings: string[];
}

export interface AegisAnalysisResult {
  id: string;
  productId: string;
  timestamp: string;
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  verdict: AegisVerdict;
  confidence: number; // 0.0 - 1.0
  productSnapshot: ProductListing;
  priceIntel: PriceIntelligence;
  sellerIntel: SellerIntelligence;
  reviewIntel: ReviewIntelligence;
  descriptionIntel: DescriptionIntelligence;
  authenticityIntel: AuthenticityIntelligence;
  scamLanguageIntel: ScamLanguageIntelligence;
  indicators: DetectedIndicator[];
  summaryExplanation: string;
  recommendedAction: string;
  isProAnalysis: boolean;
}

export interface SitePermission {
  id: string;
  domain: string;
  grantedAt: string;
  status: 'ACTIVE' | 'PAUSED' | 'REVOKED';
  autoScanEnabled: boolean;
  scannedCount: number;
}

export interface SubscriptionStatus {
  tier: 'FREE' | 'PRO';
  status: 'ACTIVE' | 'TRIAL';
  scansUsedThisMonth: number;
  scanLimitMonthly: number;
  expiresAt: string;
  features: {
    advancedAiReviewAnalysis: boolean;
    authenticityEngine: boolean;
    productComparison: boolean;
    unlimitedHistory: boolean;
    crossSiteAnalysis: boolean;
    priorityProcessing: boolean;
  };
}

export interface ModelMetricData {
  modelName: string;
  modelType: string;
  datasetSize: number;
  trainSize: number;
  testSize: number;
  lastUpdated: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  featureWeights: { feature: string; weight: number }[];
}

export type NotificationType =
  | 'PRICE_HIKE'
  | 'SELLER_RATING_DROP'
  | 'SUSPICIOUS_SELLER_CHANGE'
  | 'RISK_ESCALATION';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AegisNotification {
  id: string;
  productId: string;
  productTitle: string;
  marketplace: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  details: {
    oldValue: number | string;
    newValue: number | string;
    percentageChange?: number;
    reason?: string;
  };
}

export interface TrackedProduct {
  id: string;
  productId: string;
  title: string;
  marketplace: 'Amazon' | 'Flipkart' | 'Generic';
  brand: string;
  category: string;
  initialPrice: number;
  currentPrice: number;
  currency: string;
  initialSellerRating: number;
  currentSellerRating: number;
  sellerName: string;
  trackedSince: string;
  lastChecked: string;
  priceChangePercent: number;
  sellerRatingDelta: number;
  status: 'ACTIVE' | 'ALERT';
  activeAlertCount: number;
  priceHistory: { timestamp: string; price: number }[];
  ratingHistory: { timestamp: string; rating: number }[];
}

export interface DashboardStats {
  totalScans: number;
  highRiskCount: number;
  elevatedRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  topRiskCategory: string;
  scamAttemptsIntercepted: number;
  recentAnalyses: AegisAnalysisResult[];
  unreadNotificationsCount: number;
  activeTrackedProductsCount: number;
  notifications: AegisNotification[];
  trackedProducts: TrackedProduct[];
}
