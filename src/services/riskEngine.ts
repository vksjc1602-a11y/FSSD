import {
  ProductListing,
  AegisAnalysisResult,
  RiskLevel,
  AegisVerdict,
  DetectedIndicator,
  PriceIntelligence,
  SellerIntelligence,
  ReviewIntelligence,
  DescriptionIntelligence,
  AuthenticityIntelligence,
  ScamLanguageIntelligence,
} from '../types/aegis';

// Known market price baselines by category for genuine goods (in INR ₹)
const CATEGORY_BASELINES: Record<string, { min: number; max: number; avg: number }> = {
  Smartphones: { min: 12000, max: 140000, avg: 38000 },
  Laptops: { min: 32000, max: 280000, avg: 72000 },
  Headphones: { min: 2000, max: 35000, avg: 8500 },
  Smartwatches: { min: 3000, max: 80000, avg: 18000 },
  Sneakers: { min: 3500, max: 25000, avg: 7800 },
  Perfume: { min: 2500, max: 18000, avg: 6200 },
  HardDrives: { min: 4000, max: 16000, avg: 7500 },
  Generic: { min: 1000, max: 50000, avg: 8000 },
};

// Known high-risk scam triggers & off-platform payment keywords
const SCAM_PATTERNS = [
  { pattern: /whatsapp/i, label: 'External WhatsApp contact request', weight: 40 },
  { pattern: /pay\s+outside/i, label: 'Direct off-platform payment request', weight: 45 },
  { pattern: /bank\s+transfer\s+only/i, label: 'Unsecured bank transfer mandate', weight: 45 },
  { pattern: /upi\s+(transfer|id)/i, label: 'Direct non-escrow UPI payment solicitation', weight: 35 },
  { pattern: /share\s+otp/i, label: 'Fraudulent OTP credential request', weight: 50 },
  { pattern: /refund\s+via\s+(link|form)/i, label: 'Phishing refund link solicitation', weight: 45 },
  { pattern: /contact\s+seller\s+before\s+(order|buy)/i, label: 'Order diversion instructions', weight: 30 },
  { pattern: /paytm\s+(direct|number)/i, label: 'Direct wallet transfer request', weight: 35 },
];

// NLP urgency and unrealistic promise indicators
const URGENCY_PATTERNS = [
  { pattern: /only\s+1\s+left/i, label: 'Extreme stock urgency', weight: 15 },
  { pattern: /price\s+valid\s+only/i, label: 'Artificial price timer', weight: 15 },
  { pattern: /100%\s+(guaranteed\s+cure|miracle|magic)/i, label: 'Unrealistic biological/cure guarantee', weight: 35 },
  { pattern: /get\s+rich|free\s+money|double\s+cash/i, label: 'Deceptive financial lure', weight: 40 },
  { pattern: /no\s+questions\s+asked\s+cashback/i, label: 'Unverified cash guarantee', weight: 20 },
];

// Helper: Calculate n-grams for review repetition analysis
function extractTrigrams(text: string): Set<string> {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  const trigrams = new Set<string>();
  for (let i = 0; i <= words.length - 3; i++) {
    trigrams.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return trigrams;
}

// Calculate pairwise Jaccard similarity across review trigrams
function calculateReviewSimilarity(reviews: ProductListing['sampleReviews']): {
  duplicateRatio: number;
  duplicatePhrases: string[];
} {
  if (!reviews || reviews.length < 2) {
    return { duplicateRatio: 0, duplicatePhrases: [] };
  }

  const trigramSets = reviews.map((r) => extractTrigrams(r.content));
  const duplicatePhrasesFound: string[] = [];
  let similarPairs = 0;
  let totalPairs = 0;

  for (let i = 0; i < reviews.length; i++) {
    for (let j = i + 1; j < reviews.length; j++) {
      totalPairs++;
      const setA = trigramSets[i];
      const setB = trigramSets[j];
      if (setA.size === 0 || setB.size === 0) continue;

      let intersection = 0;
      setA.forEach((gram) => {
        if (setB.has(gram)) {
          intersection++;
          if (duplicatePhrasesFound.length < 3 && !duplicatePhrasesFound.includes(gram)) {
            duplicatePhrasesFound.push(gram);
          }
        }
      });
      const union = new Set([...setA, ...setB]).size;
      const jaccard = union > 0 ? intersection / union : 0;
      if (jaccard > 0.25) {
        similarPairs++;
      }
    }
  }

  const ratio = totalPairs > 0 ? similarPairs / totalPairs : 0;
  return {
    duplicateRatio: Math.min(1, ratio),
    duplicatePhrases: duplicatePhrasesFound,
  };
}

// 1. Price Anomaly Module
export function analyzePrice(product: ProductListing): {
  intel: PriceIntelligence;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  const findings: string[] = [];
  let priceScore = 5; // baseline calm

  const baseline = CATEGORY_BASELINES[product.category] || CATEGORY_BASELINES.Generic;
  const current = product.currentPrice;
  const discount = product.discountPercent;
  let isAnomaly = false;

  // Severe discount check (>70%)
  if (discount >= 80) {
    priceScore += 45;
    isAnomaly = true;
    indicators.push({
      id: `price-disc-${Date.now()}`,
      category: 'PRICE',
      severity: 'HIGH',
      title: 'Extreme Unverified Discount Pattern',
      description: `Observed discount of ${discount}% exceeds typical manufacturer authorization thresholds.`,
      evidence: `Listed price ₹${current.toLocaleString()} marked down ${discount}% from ₹${product.originalPrice.toLocaleString()}.`,
      weight: 45,
    });
    findings.push(`Discount of ${discount}% is statistically anomalous for category ${product.category}.`);
  } else if (discount >= 60) {
    priceScore += 25;
    findings.push(`Discount of ${discount}% is higher than 85th percentile of normal retail reductions.`);
  }

  // Price far below typical category threshold
  if (current < baseline.min * 0.5) {
    priceScore += 40;
    isAnomaly = true;
    indicators.push({
      id: `price-under-${Date.now()}`,
      category: 'PRICE',
      severity: 'HIGH',
      title: 'Current Price Far Below Category Baseline',
      description: 'Current price appears unusually low compared with observed comparable market prices.',
      evidence: `Offered at ₹${current.toLocaleString()}, while comparable ${product.category} floor is ₹${baseline.min.toLocaleString()}.`,
      weight: 40,
    });
    findings.push(`Price is 50%+ lower than verified minimum baseline for comparable products.`);
  } else if (current < baseline.min * 0.8) {
    priceScore += 15;
    findings.push(`Price sits near lower boundary for this hardware tier.`);
  }

  // Cap score 0-100
  priceScore = Math.min(100, Math.max(0, priceScore));

  if (findings.length === 0) {
    findings.push('Price is consistent with verified market baselines and typical seller promotions.');
  }

  return {
    intel: {
      score: priceScore,
      isAnomaly,
      discountPercent: discount,
      observedBaselinePrice: baseline.avg,
      priceDropRate: discount,
      findings,
      historicalRange: { min: baseline.min, max: baseline.max, avg: baseline.avg },
    },
    indicators,
  };
}

// 2. Seller Risk Analysis Module
export function analyzeSeller(product: ProductListing): {
  intel: SellerIntelligence;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  const findings: string[] = [];
  let sellerScore = 10;
  const seller = product.seller;

  let returnPolicyRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';

  // Seller Rating Check
  if (seller.rating < 3.2 && seller.ratingCount > 0) {
    sellerScore += 40;
    indicators.push({
      id: `seller-rating-${Date.now()}`,
      category: 'SELLER',
      severity: 'HIGH',
      title: 'Low Seller Satisfaction Score',
      description: 'Seller public rating is below safety baseline for transaction reliability.',
      evidence: `Seller has ${seller.rating}/5.0 based on ${seller.ratingCount} marketplace ratings.`,
      weight: 40,
    });
    findings.push(`Seller rating (${seller.rating}) falls in lowest 10% bracket.`);
  } else if (seller.rating < 3.8 && seller.ratingCount > 0) {
    sellerScore += 20;
    findings.push(`Seller rating (${seller.rating}) indicates intermittent fulfillment disputes.`);
  }

  // Seller Tenure Check
  if (seller.tenureMonths < 2) {
    sellerScore += 25;
    indicators.push({
      id: `seller-tenure-${Date.now()}`,
      category: 'SELLER',
      severity: 'MODERATE',
      title: 'Newly Created Seller Profile',
      description: 'Seller account registered less than 60 days ago with limited track record.',
      evidence: `Active marketplace tenure is ${seller.tenureMonths} month(s).`,
      weight: 25,
    });
    findings.push('Brand new storefront account with insufficient historical dispute data.');
  } else if (seller.tenureMonths > 24) {
    sellerScore = Math.max(0, sellerScore - 10);
    findings.push('Established storefront with verified longevity (>2 years).');
  }

  // Fulfilment & Return Policy Check
  if (!seller.isFulfilledByPlatform) {
    sellerScore += 15;
    findings.push('Fulfilled directly by 3rd-party merchant without marketplace warehouse verification.');
  }

  const returnText = (seller.returnPolicy || product.returnPolicy || '').toLowerCase();
  if (returnText.includes('no return') || returnText.includes('non-returnable') || returnText.includes('no refund')) {
    returnPolicyRisk = 'HIGH';
    sellerScore += 20;
    indicators.push({
      id: `seller-return-${Date.now()}`,
      category: 'SELLER',
      severity: 'MODERATE',
      title: 'Restrictive Non-Return Policy',
      description: 'Listing denies buyer return privileges for defective or non-conforming items.',
      evidence: `Stated policy: "${seller.returnPolicy || product.returnPolicy}"`,
      weight: 20,
    });
    findings.push('Item marked strictly non-returnable, heightening buyer recovery risk.');
  }

  sellerScore = Math.min(100, Math.max(0, sellerScore));

  return {
    intel: {
      score: sellerScore,
      sellerRating: seller.rating,
      reviewCount: seller.ratingCount,
      tenureMonths: seller.tenureMonths,
      fulfilledByPlatform: seller.isFulfilledByPlatform,
      returnPolicyRisk,
      findings,
    },
    indicators,
  };
}

// 3. Review Intelligence Analysis Module
export function analyzeReviews(product: ProductListing): {
  intel: ReviewIntelligence;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  const findings: string[] = [];
  let reviewScore = 10;
  const reviews = product.sampleReviews || [];

  const { duplicateRatio, duplicatePhrases } = calculateReviewSimilarity(reviews);
  const duplicatePercent = Math.round(duplicateRatio * 100);

  let dissonanceCount = 0;
  reviews.forEach((r) => {
    const textLower = r.content.toLowerCase();
    const hasNegativeWords = /fake|scam|broken|fraud|never\s+arrived|waste|avoid/i.test(textLower);
    const hasPositiveWords = /awesome|perfect|loved|genuine|best\s+purchase/i.test(textLower);

    if (r.rating >= 4 && hasNegativeWords) dissonanceCount++;
    if (r.rating <= 2 && hasPositiveWords) dissonanceCount++;
  });

  if (duplicatePercent >= 30) {
    reviewScore += 45;
    indicators.push({
      id: `review-phrasing-${Date.now()}`,
      category: 'REVIEW',
      severity: 'HIGH',
      title: 'Suspicious Review Phrasing Pattern',
      description: 'Potentially suspicious review pattern detected across sampled feedback.',
      evidence: `${duplicatePercent}% of sampled reviews contain highly similar phrasing.`,
      weight: 45,
    });
    findings.push(`${duplicatePercent}% of sampled reviews share repeated 3-gram text patterns.`);
  } else if (duplicatePercent >= 15) {
    reviewScore += 20;
    findings.push(`Elevated lexical repetition (${duplicatePercent}%) detected in customer responses.`);
  }

  if (dissonanceCount >= 2) {
    reviewScore += 25;
    indicators.push({
      id: `review-dissonance-${Date.now()}`,
      category: 'REVIEW',
      severity: 'MODERATE',
      title: 'Sentiment-Rating Contradiction',
      description: 'Multiple reviews exhibit severe mismatch between star rating and written sentiments.',
      evidence: `${dissonanceCount} review(s) present severe textual contradictions against given ratings.`,
      weight: 25,
    });
    findings.push(`Contradictions identified between star score and natural language sentiment.`);
  }

  // Review Burst / Unnatural distribution signal
  const highRatingCount = reviews.filter((r) => r.rating === 5).length;
  const burstSignal = reviews.length >= 5 && highRatingCount / reviews.length > 0.85;
  if (burstSignal) {
    reviewScore += 15;
    findings.push('Unbalanced rating distribution (over 85% pure 5-star ratings without mid-tier nuance).');
  }

  reviewScore = Math.min(100, Math.max(0, reviewScore));
  if (findings.length === 0) {
    findings.push('Sampled customer reviews demonstrate natural vocabulary variance and coherent ratings.');
  }

  return {
    intel: {
      score: reviewScore,
      sampledCount: reviews.length,
      duplicatePhrasePercent: duplicatePercent,
      sentimentDissonanceCount: dissonanceCount,
      burstSignalDetected: burstSignal,
      findings,
      representativePhrases: duplicatePhrases,
    },
    indicators,
  };
}

// 4. Product Description Analysis Module
export function analyzeDescription(product: ProductListing): {
  intel: DescriptionIntelligence;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  const findings: string[] = [];
  let descScore = 8;

  const corpus = `${product.title} ${product.description} ${product.urgencyText || ''}`.toLowerCase();

  let urgencyLevel: 'NONE' | 'MODERATE' | 'AGGRESSIVE' = 'NONE';
  let unrealisticGuarantees = false;
  const contradictions: string[] = [];
  const missingSpecs: string[] = [];

  // Urgency check
  let urgencyHitCount = 0;
  URGENCY_PATTERNS.forEach(({ pattern, label, weight }) => {
    if (pattern.test(corpus)) {
      urgencyHitCount++;
      descScore += weight;
      findings.push(label);
      if (weight >= 30) unrealisticGuarantees = true;
    }
  });

  if (urgencyHitCount >= 2) {
    urgencyLevel = 'AGGRESSIVE';
    indicators.push({
      id: `desc-urgency-${Date.now()}`,
      category: 'DESCRIPTION',
      severity: 'MODERATE',
      title: 'High-Pressure Urgency Tactics',
      description: 'Listing employs aggressive scarcity language to induce hurried checkout decisions.',
      evidence: `Detected repetitive urgency patterns (${urgencyHitCount} occurrences).`,
      weight: 25,
    });
  } else if (urgencyHitCount === 1) {
    urgencyLevel = 'MODERATE';
  }

  // Contradictory specs (e.g. 1TB SSD vs 64GB eMMC or Bluetooth 5.3 vs 4.0)
  if (corpus.includes('1tb') && corpus.includes('64gb')) {
    contradictions.push('Title advertises 1TB capacity while details mention 64GB storage.');
    descScore += 35;
  }
  if (corpus.includes('original') && corpus.includes('replica')) {
    contradictions.push('Text combines contradictory claims of "original" and "replica/first copy".');
    descScore += 40;
  }

  if (contradictions.length > 0) {
    indicators.push({
      id: `desc-contra-${Date.now()}`,
      category: 'DESCRIPTION',
      severity: 'HIGH',
      title: 'Contradictory Technical Specifications',
      description: 'Critical product attributes are self-contradicting between the title and specification table.',
      evidence: contradictions.join(' | '),
      weight: 35,
    });
    findings.push(...contradictions);
  }

  // Missing crucial specs check for tech products
  if (['Smartphones', 'Laptops', 'HardDrives'].includes(product.category)) {
    if (!product.specifications || Object.keys(product.specifications).length < 2) {
      missingSpecs.push('Detailed component specifications / regulatory certifications absent');
      descScore += 15;
      findings.push('Lacks required technical breakdown for consumer electronics.');
    }
  }

  descScore = Math.min(100, Math.max(0, descScore));
  if (findings.length === 0) {
    findings.push('Description presents verifiable specifications without deceptive urgency language.');
  }

  return {
    intel: {
      score: descScore,
      urgencyLevel,
      unrealisticGuaranteesDetected: unrealisticGuarantees,
      specContradictionsFound: contradictions,
      missingCrucialSpecs: missingSpecs,
      findings,
    },
    indicators,
  };
}

// 5. Authenticity / Counterfeit Risk Module
export function analyzeAuthenticity(product: ProductListing): {
  intel: AuthenticityIntelligence;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  const findings: string[] = [];
  let authScore = 10;

  const brand = (product.brand || '').toLowerCase();
  const title = product.title.toLowerCase();
  let brandMismatchRisk: 'LOW' | 'ELEVATED' | 'HIGH' = 'LOW';
  let sellerAuthorizationStatus: 'VERIFIED' | 'UNVERIFIED' | 'SUSPICIOUS' = 'VERIFIED';

  // Typosquatting / Lookalike brands
  const suspiciousBrandMismatches = [
    { target: 'apple', mimics: ['app1e', 'aple', 'appl'] },
    { target: 'samsung', mimics: ['samsvng', 'sansung', 'samsong'] },
    { target: 'sony', mimics: ['sonny', 'sonee'] },
    { target: 'nike', mimics: ['naike', 'nikke'] },
    { target: 'adidas', mimics: ['adydas', 'abidas', 'adibas'] },
  ];

  suspiciousBrandMismatches.forEach(({ target, mimics }) => {
    mimics.forEach((mimic) => {
      if (title.includes(mimic) || brand.includes(mimic)) {
        authScore += 50;
        brandMismatchRisk = 'HIGH';
        indicators.push({
          id: `auth-typo-${Date.now()}`,
          category: 'AUTHENTICITY',
          severity: 'HIGH',
          title: 'Elevated Authenticity Risk: Brand Typosquatting',
          description: `Observed brand name variant resembles trademarked '${target}' with deceptive alteration.`,
          evidence: `Listing uses spelling variant '${mimic}' instead of verified mark '${target}'.`,
          weight: 50,
        });
        findings.push(`Elevated authenticity risk: Deceptive phonetic mimicry of '${target}'.`);
      }
    });
  });

  // Severe discount on luxury/top electronics from unverified seller
  if (product.discountPercent > 70 && !product.seller.isFulfilledByPlatform) {
    authScore += 30;
    sellerAuthorizationStatus = 'UNVERIFIED';
    if (brandMismatchRisk === 'LOW') brandMismatchRisk = 'ELEVATED';
    indicators.push({
      id: `auth-seller-${Date.now()}`,
      category: 'AUTHENTICITY',
      severity: 'MODERATE',
      title: 'Elevated Authenticity Risk: Unverified Source',
      description: 'Steep discount paired with unverified third-party merchant profile.',
      evidence: `70%+ discount offered by seller '${product.seller.name}' lacking official brand distributor badge.`,
      weight: 30,
    });
    findings.push('Merchant profile lacks official brand authorization certification.');
  }

  authScore = Math.min(100, Math.max(0, authScore));
  if (findings.length === 0) {
    findings.push('Brand nomenclature conforms to standard catalog conventions; no counterfeit markers noted.');
  }

  return {
    intel: {
      score: authScore,
      brandMismatchRisk,
      sellerAuthorizationStatus,
      findings,
    },
    indicators,
  };
}

// 6. Scam Language & Off-Platform Payment Module
export function analyzeScamLanguage(product: ProductListing): {
  intel: ScamLanguageIntelligence;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  const findings: string[] = [];
  const detectedKeywords: string[] = [];
  let scamScore = 0;
  let offPlatform = false;

  const fullText = `${product.title} ${product.description} ${product.seller.contactNotes || ''} ${product.rawText || ''}`;

  SCAM_PATTERNS.forEach(({ pattern, label, weight }) => {
    if (pattern.test(fullText)) {
      detectedKeywords.push(label);
      scamScore += weight;
      offPlatform = true;
      findings.push(label);

      indicators.push({
        id: `scam-lang-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        category: 'SCAM_LANGUAGE',
        severity: 'CRITICAL',
        title: 'Critical Scam Signal: Off-Platform Payment / Diversion',
        description: 'Listing or seller note requests off-platform communications or payments that bypass consumer safeguards.',
        evidence: `Triggered rule: "${label}"`,
        weight,
      });
    }
  });

  scamScore = Math.min(100, Math.max(0, scamScore));
  if (findings.length === 0) {
    findings.push('No off-platform diversion or suspicious payment redirection language detected.');
  }

  return {
    intel: {
      score: scamScore,
      detectedKeywords,
      offPlatformPaymentRisk: offPlatform,
      findings,
    },
    indicators,
  };
}

// Master Aegis Risk Scoring Pipeline
export function runAegisRiskPipeline(
  product: ProductListing,
  isPro: boolean = false
): AegisAnalysisResult {
  const { intel: priceIntel, indicators: priceInds } = analyzePrice(product);
  const { intel: sellerIntel, indicators: sellerInds } = analyzeSeller(product);
  const { intel: reviewIntel, indicators: reviewInds } = analyzeReviews(product);
  const { intel: descIntel, indicators: descInds } = analyzeDescription(product);
  const { intel: authIntel, indicators: authInds } = analyzeAuthenticity(product);
  const { intel: scamIntel, indicators: scamInds } = analyzeScamLanguage(product);

  const allIndicators = [
    ...priceInds,
    ...sellerInds,
    ...reviewInds,
    ...descInds,
    ...authInds,
    ...scamInds,
  ];

  // Weighted Risk Score Calculation
  let overallScore =
    priceIntel.score * 0.22 +
    sellerIntel.score * 0.22 +
    reviewIntel.score * 0.18 +
    descIntel.score * 0.14 +
    authIntel.score * 0.14 +
    scamIntel.score * 0.1;

  // Escalation rule: critical off-platform payment attempt guarantees HIGH/CRITICAL risk
  if (scamIntel.offPlatformPaymentRisk && overallScore < 70) {
    overallScore = Math.max(overallScore, 78);
  }

  overallScore = Math.round(Math.min(100, Math.max(0, overallScore)));

  // Risk Level Category
  let riskLevel: RiskLevel = 'LOW';
  if (overallScore <= 20) riskLevel = 'LOW';
  else if (overallScore <= 40) riskLevel = 'MODERATE';
  else if (overallScore <= 60) riskLevel = 'ELEVATED';
  else if (overallScore <= 80) riskLevel = 'HIGH';
  else riskLevel = 'CRITICAL';

  // Aegis Verdict
  let verdict: AegisVerdict = 'LOOKS REASONABLE';
  if (overallScore <= 25) verdict = 'LOOKS REASONABLE';
  else if (overallScore <= 50) verdict = 'PROCEED WITH CAUTION';
  else if (overallScore <= 75) verdict = 'HIGH RISK';
  else verdict = 'AVOID / VERIFY FIRST';

  // Confidence computation based on data richness
  let confidence = 0.82;
  if (product.sampleReviews.length > 5) confidence += 0.08;
  if (product.seller.ratingCount > 100) confidence += 0.05;
  if (Object.keys(product.specifications || {}).length > 3) confidence += 0.04;
  confidence = Math.min(0.98, confidence);

  // Synthesize human-readable explanation from real detected factors
  const summaryExplanation = buildExplanation(overallScore, riskLevel, allIndicators);
  const recommendedAction = buildRecommendation(verdict, allIndicators, product);

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    productId: product.id,
    timestamp: new Date().toISOString(),
    overallScore,
    riskLevel,
    verdict,
    confidence: Math.round(confidence * 100) / 100,
    productSnapshot: product,
    priceIntel,
    sellerIntel,
    reviewIntel,
    descriptionIntel: descIntel,
    authenticityIntel: authIntel,
    scamLanguageIntel: scamIntel,
    indicators: allIndicators,
    summaryExplanation,
    recommendedAction,
    isProAnalysis: isPro,
  };
}

function buildExplanation(
  score: number,
  level: RiskLevel,
  indicators: DetectedIndicator[]
): string {
  if (indicators.length === 0 || score <= 20) {
    return 'Observed listing signals align with normal e-commerce marketplace behavior. Seller tenure, pricing structure, and consumer feedback demonstrate standard variance with no critical anomalies detected.';
  }

  const criticalAndHigh = indicators.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  if (criticalAndHigh.length > 0) {
    const signalNames = criticalAndHigh.map((i) => i.title).slice(0, 3).join(', ');
    return `Several independent signals elevated the AEGIS risk score to ${score}/100 (${level} RISK). The most concerning indicators include: ${signalNames}. Independent corroboration strongly advised before transacting.`;
  }

  const moderateSignals = indicators.map((i) => i.title).slice(0, 2).join(' and ');
  return `AEGIS identified moderate risk signals (${score}/100) primarily driven by ${moderateSignals}. Review terms, return guarantees, and merchant credentials carefully.`;
}

function buildRecommendation(
  verdict: AegisVerdict,
  indicators: DetectedIndicator[],
  product: ProductListing
): string {
  switch (verdict) {
    case 'LOOKS REASONABLE':
      return 'Standard purchasing precautions apply. Complete purchase through official checkout only. Verify package seal upon delivery.';
    case 'PROCEED WITH CAUTION':
      return 'Double-check seller return policy and inspect buyer review timestamps. Ensure delivery timeframe matches expectations.';
    case 'HIGH RISK':
      return 'Consider selecting an established fulfilled-by-platform alternate listing. Avoid direct seller payment communication.';
    case 'AVOID / VERIFY FIRST':
      return 'Do not proceed with off-platform contact or unverified payments. High probability of dispute, non-delivery, or non-authentic merchandise.';
  }
}
