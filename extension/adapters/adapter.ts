import { ProductListing, SellerInfo, ReviewItem } from '../../src/types/aegis';

export interface ISiteAdapter {
  name: string;
  matchUrl(url: string): boolean;
  detectProductPage(): boolean;
  extractProduct(): Promise<ProductListing | null>;
  extractPrice(): { currentPrice: number; originalPrice: number; discountPercent: number; currency: string };
  extractSeller(): SellerInfo;
  extractRatings(): { rating: number; ratingCount: number; reviewCount: number };
  extractReviews(): ReviewItem[];
  extractDescription(): string;
  extractSpecifications(): Record<string, string>;
  extractImages(): string[];
}
