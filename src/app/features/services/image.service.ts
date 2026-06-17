// core/services/image.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly placeholders = {
    hero: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800',
    product: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    avatar: 'https://ui-avatars.com/api/?background=22C55E&color=fff&bold=true'
  };

  getImageUrl(path: string | null | undefined, type: 'hero' | 'product' | 'avatar' = 'product'): string {
    if (path && path.trim() !== '') {
      return path.startsWith('http') ? path : `${environment.assetsUrl}/${path}`;
    }
    return this.placeholders[type];
  }

  getProductImage(product: any): string {
    if (product?.images?.length > 0) {
      const mainImage = product.images.find((img: any) => img.principale);
      return mainImage?.url || product.images[0]?.url || this.placeholders.product;
    }
    return this.placeholders.product;
  }
}