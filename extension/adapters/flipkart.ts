import { ISiteAdapter } from './adapter';
import { ProductListing, SellerInfo, ReviewItem } from '../../src/types/aegis';

export class FlipkartAdapter implements ISiteAdapter {
  name = 'FlipkartAdapter';

  matchUrl(url: string): boolean {
    return /flipkart\.com/i.test(url);
  }

  detectProductPage(): boolean {
    return /\/p\/itm/i.test(window.location.pathname) ||
      document.querySelector('span.B_NuCI, h1._6EBuvT') !== null;
  }

  extractPrice(): { currentPrice: number; originalPrice: number; discountPercent: number; currency: string } {
    let current = 0;
    let original = 0;

    const priceEl = document.querySelector('div._30jeq3, div.Nx9bqj');
    if (priceEl) {
      current = Number(priceEl.textContent?.replace(/[^0-9]/g, '') || '0');
    }

    const mrpEl = document.querySelector('div._3I9_wc, div.yRaY8j');
    if (mrpEl) {
      original = Number(mrpEl.textContent?.replace(/[^0-9]/g, '') || current);
    } else {
      original = current;
    }

    const discountEl = document.querySelector('div._3Ay6Sb, div.UkUFwK');
    let discount = 0;
    if (discountEl) {
      discount = parseInt(discountEl.textContent?.replace(/[^0-9]/g, '') || '0', 10);
    }

    return { currentPrice: current || 1, originalPrice: original || current || 1, discountPercent: discount, currency: 'INR' };
  }

  extractSeller(): SellerInfo {
    const sellerEl = document.querySelector('#sellerName, div._1RLviY');
    const name = sellerEl?.textContent?.replace(/^[0-9.]+\s*/, '')?.trim() || 'Retail Merchant';

    return {
      id: `fk-seller-${Date.now()}`,
      name: name.substring(0, 50),
      rating: 4.1,
      ratingCount: 220,
      tenureMonths: 18,
      isFulfilledByPlatform: /f-assured/i.test(document.body.innerText),
      returnPolicy: '7 Days Returnable',
      warrantyClaims: 'Brand Warranty Applicable',
    };
  }

  extractRatings(): { rating: number; ratingCount: number; reviewCount: number } {
    let rating = 4.2;
    const ratingEl = document.querySelector('div._3LWZlK, div.XQDdHH');
    if (ratingEl) {
      rating = parseFloat(ratingEl.textContent || '4.2');
    }

    const ratingsCountEl = document.querySelector('span._2_R_DZ, span.Wphh3N');
    let ratingCount = 500;
    if (ratingsCountEl) {
      const match = ratingsCountEl.textContent?.match(/([0-9,]+)\s+Ratings/i);
      if (match) {
        ratingCount = parseInt(match[1].replace(/,/g, ''), 10);
      }
    }

    return { rating, ratingCount, reviewCount: Math.round(ratingCount * 0.2) };
  }

  extractReviews(): ReviewItem[] {
    const reviews: ReviewItem[] = [];
    const reviewCards = document.querySelectorAll('div._27M-vq, div.EPCmJX');

    reviewCards.forEach((card, index) => {
      if (index >= 6) return;
      const title = card.querySelector('p._2-N8zT, p.z9E0IG')?.textContent?.trim() || '';
      const content = card.querySelector('div.t-ZTKy, div.ZmyHeo')?.textContent?.trim() || '';
      const author = card.querySelector('p._2sc7ZR, p._2NsDsF')?.textContent?.trim() || 'Verified Buyer';

      reviews.push({
        id: `fk-rev-${index}`,
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
    const descEl = document.querySelector('div._1mXWr/*, div._1AN8hF, div.Rmo7Gf');
    return (descEl?.textContent || '').substring(0, 1500);
  }

  extractSpecifications(): Record<string, string> {
    const specs: Record<string, string> = {};
    const rows = document.querySelectorAll('tr._1s_Smc, tr.WJdYP6');
    rows.forEach((row) => {
      const tdKey = row.querySelector('td._1hKmbr, td.+30jeq')?.textContent?.trim();
      const tdVal = row.querySelector('td.URwL2w, td.IocvoZ')?.textContent?.trim();
      if (tdKey && tdVal) {
        specs[tdKey] = tdVal;
      }
    });
    return specs;
  }

  extractImages(): string[] {
    const imgEl = document.querySelector('img._396cs4, img.DByuf4') as HTMLImageElement;
    return imgEl?.src ? [imgEl.src] : [];
  }

  async extractProduct(): Promise<ProductListing | null> {
    const titleEl = document.querySelector('span.B_NuCI, h1._6EBuvT');
    if (!titleEl) return null;

    const title = titleEl.textContent?.trim() || 'Untitled Flipkart Product';
    const priceData = this.extractPrice();
    const seller = this.extractSeller();
    const ratings = this.extractRatings();
    const reviews = this.extractReviews();
    const description = this.extractDescription();
    const specs = this.extractSpecifications();
    const images = this.extractImages();

    return {
      id: `flipkart-${Date.now()}`,
      url: window.location.href,
      title,
      marketplace: 'Flipkart',
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
