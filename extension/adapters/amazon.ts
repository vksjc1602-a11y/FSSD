import { ISiteAdapter } from './adapter';
import { ProductListing, SellerInfo, ReviewItem } from '../../src/types/aegis';

export class AmazonAdapter implements ISiteAdapter {
  name = 'AmazonAdapter';

  matchUrl(url: string): boolean {
    return /amazon\.(com|in|co\.uk|de|ca)/i.test(url);
  }

  detectProductPage(): boolean {
    return /\/(dp|gp\/product)\/[A-Z0-9]{10}/i.test(window.location.pathname) ||
      document.querySelector('#productTitle') !== null;
  }

  extractPrice(): { currentPrice: number; originalPrice: number; discountPercent: number; currency: string } {
    let current = 0;
    let original = 0;
    let currency = 'INR';

    const priceWhole = document.querySelector('.a-price .a-price-whole');
    const priceFraction = document.querySelector('.a-price .a-price-fraction');
    if (priceWhole) {
      const cleaned = priceWhole.textContent?.replace(/[^0-9]/g, '') || '0';
      current = Number(cleaned);
      if (priceFraction) {
        current += Number(priceFraction.textContent?.replace(/[^0-9]/g, '') || '0') / 100;
      }
    }

    const basisPrice = document.querySelector('.basisPrice .a-price .a-offscreen, .a-text-price .a-offscreen');
    if (basisPrice) {
      original = Number(basisPrice.textContent?.replace(/[^0-9.]/g, '') || current);
    } else {
      original = current;
    }

    const discountEl = document.querySelector('.savingPriceOverride, .savingsPercentage');
    let discount = 0;
    if (discountEl) {
      discount = Math.abs(parseInt(discountEl.textContent?.replace(/[^0-9-]/g, '') || '0', 10));
    } else if (original > current && original > 0) {
      discount = Math.round(((original - current) / original) * 100);
    }

    return { currentPrice: current || 1, originalPrice: original || current || 1, discountPercent: discount, currency };
  }

  extractSeller(): SellerInfo {
    const merchantInfo = document.querySelector('#merchant-info, #sellerProfileTriggerId');
    const sellerName = merchantInfo?.textContent?.trim() || 'Third-Party Merchant';
    const isFulfilled = /fulfilled by amazon|amazon delivered/i.test(merchantInfo?.textContent || '');

    return {
      id: `seller-${Date.now()}`,
      name: sellerName.substring(0, 50),
      rating: 4.2,
      ratingCount: 150,
      tenureMonths: 12,
      isFulfilledByPlatform: isFulfilled,
      returnPolicy: '7-10 Days Replacement / Return Policy',
      warrantyClaims: 'Manufacturer Warranty as specified in details',
    };
  }

  extractRatings(): { rating: number; ratingCount: number; reviewCount: number } {
    let rating = 4.0;
    const ratingEl = document.querySelector('#acrPopover .a-icon-alt, span[data-hook="rating-out-of-text"]');
    if (ratingEl) {
      const match = ratingEl.textContent?.match(/([0-9.]+)/);
      if (match) rating = parseFloat(match[1]);
    }

    let ratingCount = 100;
    const countEl = document.querySelector('#acrCustomerReviewText');
    if (countEl) {
      ratingCount = parseInt(countEl.textContent?.replace(/[^0-9]/g, '') || '100', 10);
    }

    return { rating, ratingCount, reviewCount: Math.round(ratingCount * 0.3) };
  }

  extractReviews(): ReviewItem[] {
    const reviews: ReviewItem[] = [];
    const reviewCards = document.querySelectorAll('.review, div[data-hook="review"]');

    reviewCards.forEach((card, index) => {
      if (index >= 8) return;
      const title = card.querySelector('[data-hook="review-title"]')?.textContent?.trim() || '';
      const content = card.querySelector('[data-hook="review-body"]')?.textContent?.trim() || '';
      const author = card.querySelector('.a-profile-name')?.textContent?.trim() || 'Customer';
      reviews.push({
        id: `rev-${index}`,
        author,
        title,
        content,
        rating: 5,
        date: new Date().toISOString().substring(0, 10),
        verifiedPurchase: true,
      });
    });

    return reviews;
  }

  extractDescription(): string {
    const featureBullets = document.querySelector('#feature-bullets')?.textContent?.trim() || '';
    const prodDesc = document.querySelector('#productDescription')?.textContent?.trim() || '';
    return `${featureBullets} ${prodDesc}`.substring(0, 1500);
  }

  extractSpecifications(): Record<string, string> {
    const specs: Record<string, string> = {};
    const rows = document.querySelectorAll('#productDetails_techSpec_section_1 tr, #prodDetails tr');
    rows.forEach((row) => {
      const th = row.querySelector('th')?.textContent?.trim();
      const td = row.querySelector('td')?.textContent?.trim();
      if (th && td) {
        specs[th] = td;
      }
    });
    return specs;
  }

  extractImages(): string[] {
    const imgEl = document.querySelector('#landingImage, #imgBlkFront') as HTMLImageElement;
    return imgEl?.src ? [imgEl.src] : [];
  }

  async extractProduct(): Promise<ProductListing | null> {
    const titleEl = document.querySelector('#productTitle');
    if (!titleEl) return null;

    const title = titleEl.textContent?.trim() || 'Untitled Amazon Product';
    const priceData = this.extractPrice();
    const seller = this.extractSeller();
    const ratings = this.extractRatings();
    const reviews = this.extractReviews();
    const description = this.extractDescription();
    const specs = this.extractSpecifications();
    const images = this.extractImages();

    return {
      id: `amz-${Date.now()}`,
      url: window.location.href,
      title,
      marketplace: 'Amazon',
      category: 'Generic',
      brand: 'Generic',
      currentPrice: priceData.currentPrice,
      originalPrice: priceData.originalPrice,
      currency: priceData.currency,
      discountPercent: priceData.discountPercent,
      rating: ratings.rating,
      ratingCount: ratings.ratingCount,
      reviewCount: ratings.reviewCount,
      description,
      specifications: specs,
      images,
      seller,
      sampleReviews: reviews,
    };
  }
}
