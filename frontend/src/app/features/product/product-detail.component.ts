import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
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

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
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
      <div class="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        <div>
          <div class="aspect-square rounded-2xl overflow-hidden bg-jewel-cream border border-jewel-rose/40">
            <img [src]="mainImage(p)" [alt]="p.name" class="w-full h-full object-cover" />
          </div>
          <div class="flex gap-2 mt-3 overflow-x-auto" *ngIf="p.images?.length">
            <button
              type="button"
              *ngFor="let img of p.images"
              (click)="selectedImage = img.imageUrl"
              class="w-16 h-16 rounded-lg overflow-hidden border shrink-0"
              [class.border-jewel-gold]="selectedImage === img.imageUrl"
            >
              <img [src]="img.imageUrl" [alt]="img.altText || p.name" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-widest text-jewel-gold mb-2">Invicta Jewel</p>
          <nav class="text-sm text-neutral-500 mb-3 flex flex-wrap gap-1">
            <a routerLink="/" class="hover:text-jewel-gold">Home</a>
            <span *ngFor="let c of p.categories; let last = last">
              <span class="mx-1">/</span>
              <a [routerLink]="['/category', c.slug]" class="hover:text-jewel-gold">{{ c.name }}</a>
            </span>
          </nav>
          <h1 class="font-display text-4xl text-jewel-charcoal mb-4">{{ p.name }}</h1>
          <div class="font-price text-2xl text-jewel-gold mb-6 flex gap-3 items-baseline">
            <ng-container *ngIf="p.salePrice != null && p.salePrice < p.regularPrice; else reg">
              <span>{{ p.salePrice | currency }}</span>
              <span class="text-base text-neutral-500 line-through">{{ p.regularPrice | currency }}</span>
            </ng-container>
            <ng-template #reg>
              <span>{{ p.regularPrice | currency }}</span>
            </ng-template>
          </div>
          <p class="text-neutral-700 leading-relaxed mb-6">{{ p.description }}</p>
          <div class="flex items-center gap-4 mb-6">
            <label class="text-sm font-medium">Qty</label>
            <input type="number" min="1" [max]="p.stockQuantity" [(ngModel)]="qty" class="w-20 border rounded-md px-2 py-1" />
          </div>
          <button mat-raised-button color="primary" class="!bg-jewel-gold !text-white" (click)="add(p.id)">Add to cart</button>
        </div>
      </div>
      @if (related$ | async; as related) {
        @if (related.length) {
          <div class="max-w-6xl mx-auto px-4 pb-14">
            <h2 class="font-display text-2xl mb-4 text-jewel-charcoal">You may also like</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    return p.images?.find((i) => i.isPrimary)?.imageUrl ?? p.primaryImageUrl ?? '/favicon.ico';
  }

  add(productId: number) {
    this.cart.addItem(productId, this.qty).subscribe({
      next: () => this.snack.open('Added to cart', 'Close', { duration: 2000 }),
      error: () => this.snack.open('Unable to add', 'Close', { duration: 2500 }),
    });
  }
}
