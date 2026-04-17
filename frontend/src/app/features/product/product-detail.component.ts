import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { map, of, switchMap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductListDto } from '../../models/api.types';
import { getImageUrl } from '../../core/utils/image-url.util';
import { PkrCurrencyPipe } from '../../shared/pipes/pkr-currency.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    PkrCurrencyPipe,
    RouterLink,
    MatButtonModule,
    FormsModule,
    NgFor,
    NgIf,
    ProductCardComponent,
  ],
  template: `
    @if (product$ | async; as p) {
      <div class="bg-app-bg text-app-ink min-h-screen">
        <div class="ij-page py-8 md:py-10 grid md:grid-cols-2 gap-8 md:gap-10">
          <div>
            <div class="aspect-[3/4] max-h-[min(85vh,720px)] rounded-xl overflow-hidden bg-app-field border border-app-border shadow-card">
              <img [src]="getImageUrl(mainImage(p))" [alt]="p.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex gap-2 mt-4 overflow-x-auto pb-1" *ngIf="p.images && p.images.length">
              <button
                type="button"
                *ngFor="let img of p.images"
                (click)="selectedImage = img.imageUrl"
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 shrink-0 transition border-app-border"
                [class.border-app-accent]="selectedImage === img.imageUrl"
                [class.ring-2]="selectedImage === img.imageUrl"
                [class.ring-offset-2]="selectedImage === img.imageUrl"
                [class.ring-app-accent]="selectedImage === img.imageUrl"
                [class.ring-offset-app-bg]="selectedImage === img.imageUrl"
              >
                <img [src]="getImageUrl(img.imageUrl)" [alt]="img.altText || p.name" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-6">
            <div>
              <p class="text-xs uppercase tracking-widest text-app-accent mb-2">Invicta Jewel</p>
              <nav class="text-sm text-app-ink-muted mb-3 flex flex-wrap gap-1">
                <a routerLink="/" class="hover:text-app-accent transition-colors">Home</a>
                <span *ngFor="let c of p.categories; let last = last">
                  <span class="mx-1">/</span>
                  <a [routerLink]="['/category', c.slug]" class="hover:text-app-accent transition-colors">{{ c.name }}</a>
                </span>
              </nav>
              <h1 class="font-display text-4xl text-app-ink mb-4">{{ p.name }}</h1>
            </div>
            <div>
              <div class="font-price text-2xl text-app-accent flex gap-3 items-baseline mb-4">
                <ng-container *ngIf="p.salePrice != null && p.salePrice < p.regularPrice; else reg">
                  <span>{{ p.salePrice | pkrCurrency }}</span>
                  <span class="text-base text-app-ink-muted line-through">{{ p.regularPrice | pkrCurrency }}</span>
                </ng-container>
                <ng-template #reg>
                  <span>{{ p.regularPrice | pkrCurrency }}</span>
                </ng-template>
              </div>
              <p class="text-app-ink-muted leading-relaxed mb-6 text-sm">{{ p.description }}</p>
            </div>
            <div class="flex items-end gap-4">
              <div class="flex-1">
                <label class="text-sm font-medium text-app-ink block mb-2">Quantity</label>
                <input type="number" min="1" [max]="p.stockQuantity" [(ngModel)]="qty" class="ij-native-input w-full max-w-[120px]" />
              </div>
              <button mat-raised-button color="primary" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal !px-8 !py-3" (click)="add(p.id)">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
      @if (related$ | async; as related) {
        @if (related.length) {
          <div class="ij-page pb-12 md:pb-14">
            <h2 class="font-display text-2xl mb-4 md:mb-6 text-app-ink">You may also like</h2>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              @for (item of related; track item.id) {
                <app-product-card [product]="item" />
              }
            </div>
          </div>
        }
      }
    }
  `,
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  protected readonly getImageUrl = getImageUrl;

  qty = 1;
  selectedImage: string | null = null;

  readonly product$ = this.route.paramMap.pipe(
    map((pm) => pm.get('slug') ?? ''),
    switchMap((slug) => this.products.bySlug(slug))
  );

  readonly related$ = this.route.paramMap.pipe(
    map((pm) => pm.get('slug') ?? ''),
    switchMap((slug) => this.products.bySlug(slug)),
    switchMap((p) => {
      const cid = p.categories?.[0]?.id;
      if (!cid) return of<ProductListDto[]>([]);
      return this.products.search({ categoryId: cid, pageSize: 8 }).pipe(
        map((r) => r.items.filter((i) => i.id !== p.id).slice(0, 4))
      );
    })
  );

  mainImage(p: { primaryImageUrl?: string | null; images?: { imageUrl: string; isPrimary: boolean }[] }) {
    if (this.selectedImage) return this.selectedImage;
    return p.images?.find((i) => i.isPrimary)?.imageUrl ?? p.primaryImageUrl ?? null;
  }

  add(productId: number) {
    this.cart.addItem(productId, this.qty).subscribe({
      next: () => this.toast.success('Added to cart', { duration: 2000 }),
      error: () => this.toast.error('Unable to add to cart'),
    });
  }
}
