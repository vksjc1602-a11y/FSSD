"""
AEGIS Python FastAPI Backend Engine
Autonomous AI Security Layer for Digital Commerce
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uvicorn

app = FastAPI(
    title="AEGIS API",
    description="AI Security Layer for Digital Commerce - Threat Detection & Risk Telemetry Engine",
    version="3.4.0",
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class SellerSchema(BaseModel):
    id: str
    name: str
    rating: float
    ratingCount: int
    tenureMonths: int
    isFulfilledByPlatform: bool
    returnPolicy: str
    warrantyClaims: str
    contactNotes: Optional[str] = None
    externalPaymentRequested: Optional[bool] = False

class ReviewItemSchema(BaseModel):
    id: str
    author: str
    rating: float
    date: str
    title: str
    content: str
    verifiedPurchase: bool

class ProductListingSchema(BaseModel):
    id: str
    url: str
    title: str
    marketplace: str
    category: str
    brand: str
    currentPrice: float
    originalPrice: float
    currency: str = "INR"
    discountPercent: float
    rating: float
    ratingCount: int
    reviewCount: int
    description: str
    specifications: Dict[str, str] = Field(default_factory=dict)
    images: List[str] = Field(default_factory=list)
    seller: SellerSchema
    sampleReviews: List[ReviewItemSchema] = Field(default_factory=list)
    deliveryClaim: Optional[str] = None
    returnPolicy: Optional[str] = None
    urgencyText: Optional[str] = None

class RiskFactorSchema(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    evidence: str
    weight: float

class AnalysisResponseSchema(BaseModel):
    id: str
    productId: str
    timestamp: str
    overallScore: int
    riskLevel: str
    verdict: str
    confidence: float
    indicators: List[RiskFactorSchema]
    summaryExplanation: str
    recommendedAction: str

# In-memory session database for standalone execution
analyses_db: Dict[str, Any] = {}
products_db: Dict[str, Any] = {}

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AEGIS Python FastAPI Engine",
        "version": "3.4.0",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.post("/api/v1/analyze/product", response_model=AnalysisResponseSchema)
def analyze_product(product: ProductListingSchema):
    # Execute AI Risk Evaluation Logic
    price_score = 10
    seller_score = 10
    review_score = 10
    desc_score = 10
    auth_score = 10
    scam_score = 0
    indicators = []

    # 1. Price Anomaly
    if product.discountPercent >= 80:
        price_score += 45
        indicators.append(
            RiskFactorSchema(
                id=f"p-disc-{datetime.utcnow().timestamp()}",
                category="PRICE",
                severity="HIGH",
                title="Extreme Unverified Discount Pattern",
                description=f"Observed discount of {product.discountPercent}% exceeds typical authorization standards.",
                evidence=f"Current price ₹{product.currentPrice} is {product.discountPercent}% off M.R.P. ₹{product.originalPrice}",
                weight=45.0,
            )
        )

    # 2. Seller Risk
    if product.seller.rating < 3.2:
        seller_score += 40
        indicators.append(
            RiskFactorSchema(
                id=f"s-rat-{datetime.utcnow().timestamp()}",
                category="SELLER",
                severity="HIGH",
                title="Low Seller Satisfaction Score",
                description="Seller rating is below acceptable safety threshold.",
                evidence=f"Rating {product.seller.rating}/5.0 across {product.seller.ratingCount} reviews.",
                weight=40.0,
            )
        )

    # 3. Scam Language Check
    scam_keywords = ["whatsapp", "pay outside", "bank transfer", "share otp", "paytm direct"]
    corpus = f"{product.title} {product.description} {product.seller.contactNotes or ''} {product.urgencyText or ''}".lower()
    for kw in scam_keywords:
        if kw in corpus:
            scam_score += 45
            indicators.append(
                RiskFactorSchema(
                    id=f"scam-{datetime.utcnow().timestamp()}",
                    category="SCAM_LANGUAGE",
                    severity="CRITICAL",
                    title="Critical Scam Signal: Off-Platform Payment",
                    description=f"Detected trigger soliciting unmonitored communication/payment: '{kw}'",
                    evidence=f"Trigger matched in text: '{kw}'",
                    weight=45.0,
                )
            )
            break

    # Calculate overall weighted risk score
    overall_score = int(
        price_score * 0.22 +
        seller_score * 0.22 +
        review_score * 0.18 +
        desc_score * 0.14 +
        auth_score * 0.14 +
        scam_score * 0.10
    )
    if scam_score > 30 and overall_score < 75:
        overall_score = 82

    overall_score = min(100, max(0, overall_score))

    # Determine risk level
    if overall_score <= 20:
        risk_level = "LOW"
        verdict = "LOOKS REASONABLE"
    elif overall_score <= 40:
        risk_level = "MODERATE"
        verdict = "PROCEED WITH CAUTION"
    elif overall_score <= 60:
        risk_level = "ELEVATED"
        verdict = "PROCEED WITH CAUTION"
    elif overall_score <= 80:
        risk_level = "HIGH"
        verdict = "HIGH RISK"
    else:
        risk_level = "CRITICAL"
        verdict = "AVOID / VERIFY FIRST"

    analysis_id = f"py-scan-{int(datetime.utcnow().timestamp())}"
    explanation = f"AEGIS assessed risk index at {overall_score}/100 based on {len(indicators)} detected threat signals."
    recommendation = "Verify merchant registration and insist on platform escrow checkout."

    response = AnalysisResponseSchema(
        id=analysis_id,
        productId=product.id,
        timestamp=datetime.utcnow().isoformat(),
        overallScore=overall_score,
        riskLevel=risk_level,
        verdict=verdict,
        confidence=0.91,
        indicators=indicators,
        summaryExplanation=explanation,
        recommendedAction=recommendation,
    )

    analyses_db[analysis_id] = response.dict()
    products_db[product.id] = product.dict()
    return response

@app.get("/api/v1/analyses")
def get_analyses():
    return list(analyses_db.values())

@app.get("/api/v1/analyses/{analysis_id}")
def get_analysis_by_id(analysis_id: str):
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return analyses_db[analysis_id]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
