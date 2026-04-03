import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { map, of, switchMap } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
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
    MatSnackBarModule,
    FormsModule,
    NgFor,
    NgIf,
    ProductCardComponent,
  ],
  template: `
    @if (product$ | async; as p) {
      <div class="bg-white dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen">
        <div class="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
          <div>
            <div class="aspect-[3/4] rounded-lg overflow-hidden bg-jewel-cream dark:bg-dark-bg-secondary border border-neutral-200 dark:border-dark-border">
              <img [src]="getImageUrl(mainImage(p))" [alt]="p.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex gap-2 mt-4 overflow-x-auto" *ngIf="p.images?.length">
              <button
                type="button"
                *ngFor="let img of p.images"
                (click)="selectedImage = img.imageUrl"
                class="w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition dark:border-dark-border"
                [class.border-jewel-gold]="selectedImage === img.imageUrl"
                [class.border-neutral-200]="selectedImage !== img.imageUrl"
              >
                <img [src]="getImageUrl(img.imageUrl)" [alt]="img.altText || p.name" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-6">
            <div>
              <p class="text-xs uppercase tracking-widest text-jewel-gold dark:text-jewel-gold-light mb-2">Invicta Jewel</p>
              <nav class="text-sm text-neutral-600 dark:text-dark-text-secondary mb-3 flex flex-wrap gap-1">
                <a routerLink="/" class="hover:text-jewel-gold dark:hover:text-jewel-gold-light">Home</a>
                <span *ngFor="let c of p.categories; let last = last">
                  <span class="mx-1">/</span>
                  <a [routerLink]="['/category', c.slug]" class="hover:text-jewel-gold dark:hover:text-jewel-gold-light">{{ c.name }}</a>
                </span>
              </nav>
              <h1 class="font-display text-4xl text-jewel-charcoal dark:text-dark-text mb-4">{{ p.name }}</h1>
            </div>
            <div>
              <div class="font-price text-2xl text-jewel-gold dark:text-jewel-gold-light flex gap-3 items-baseline mb-4">
                <ng-container *ngIf="p.salePrice != null && p.salePrice < p.regularPrice; else reg">
                  <span>{{ p.salePrice | pkrCurrency }}</span>
                  <span class="text-base text-neutral-500 dark:text-dark-text-secondary line-through">{{ p.regularPrice | pkrCurrency }}</span>
                </ng-container>
                <ng-template #reg>
                  <span>{{ p.regularPrice | pkrCurrency }}</span>
                </ng-template>
              </div>
              <p class="text-neutral-700 dark:text-dark-text-secondary leading-relaxed mb-6 text-sm">{{ p.description }}</p>
            </div>
            <div class="flex items-end gap-4">
              <div class="flex-1">
                <label class="text-sm font-medium text-neutral-700 dark:text-dark-text block mb-2">Quantity</label>
                <input type="number" min="1" [max]="p.stockQuantity" [(ngModel)]="qty" class="w-full border-2 rounded-lg px-3 py-2 bg-white dark:bg-dark-bg-secondary text-light-text dark:text-dark-text border-neutral-300 dark:border-dark-border focus:border-jewel-gold dark:focus:border-jewel-gold-light outline-none transition" />
              </div>
              <button mat-raised-button color="primary" class="!bg-jewel-gold dark:!bg-jewel-gold-light !text-white dark:!text-jewel-charcoal !px-8 !py-3" (click)="add(p.id)">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
      @if (related$ | async; as related) {
        @if (related.length) {
          <div class="max-w-6xl mx-auto px-4 pb-14">
            <h2 class=\"font-display text-2xl mb-4 text-jewel-charcoal dark:text-dark-text\">You may also like</h2>
            <div class=\"grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6\">
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
  private readonly snack = inject(MatSnackBar);

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
      next: () => this.snack.open('Added to cart', 'Close', { duration: 2000 }),
      error: () => this.snack.open('Unable to add', 'Close', { duration: 2500 }),
    });
  }
}
