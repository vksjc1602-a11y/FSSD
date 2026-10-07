import { ISiteAdapter } from './adapter';
import { ProductListing, SellerInfo, ReviewItem } from '../../src/types/aegis';

export class GenericCommerceAdapter implements ISiteAdapter {
  name = 'GenericCommerceAdapter';

  matchUrl(_url: string): boolean {
    return true; // Fallback
  }

  detectProductPage(): boolean {
    // Check OpenGraph or Schema.org microdata
    const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
    const hasProductSchema = document.querySelector('script[type="application/ld+json"]') !== null;
    return ogType === 'product' || ogType === 'og:product' || hasProductSchema ||
      document.querySelector('button[type="submit"][name="add"], .add-to-cart, #add-to-cart') !== null;
  }

  extractPrice(): { currentPrice: number; originalPrice: number; discountPercent: number; currency: string } {
    const priceMeta = document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content');
    let current = priceMeta ? parseFloat(priceMeta) : 0;

    if (!current) {
      const priceText = document.querySelector('[class*="price"], [id*="price"]')?.textContent || '';
      const match = priceText.match(/([0-9,.]+)/);
      if (match) current = parseFloat(match[1].replace(/,/g, ''));
    }

    return { currentPrice: current || 1999, originalPrice: current || 1999, discountPercent: 0, currency: 'INR' };
  }

  extractSeller(): SellerInfo {
    return {
      id: `generic-seller-${Date.now()}`,
      name: window.location.hostname,
      rating: 4.0,
      ratingCount: 50,
      tenureMonths: 12,
      isFulfilledByPlatform: false,
      returnPolicy: 'Subject to store terms',
      warrantyClaims: 'Unverified storefront',
    };
  }

  extractRatings(): { rating: number; ratingCount: number; reviewCount: number } {
    return { rating: 4.0, ratingCount: 20, reviewCount: 5 };
  }

  extractReviews(): ReviewItem[] {
    return [];
  }

  extractDescription(): string {
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    return metaDesc || document.body.innerText.substring(0, 500);
  }

  extractSpecifications(): Record<string, string> {
    return {};
  }

  extractImages(): string[] {
    const ogImg = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    return ogImg ? [ogImg] : [];
  }

  async extractProduct(): Promise<ProductListing | null> {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const title = ogTitle || document.title || 'Visible Web Product';

    const priceData = this.extractPrice();
    const seller = this.extractSeller();
    const ratings = this.extractRatings();
    const reviews = this.extractReviews();
    const description = this.extractDescription();

    return {
      id: `generic-${Date.now()}`,
      url: window.location.href,
      title,
      marketplace: 'Generic',
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
      specifications: {},
      images: this.extractImages(),
      seller,
      sampleReviews: reviews,
    };
  }
}
