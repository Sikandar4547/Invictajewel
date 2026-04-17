import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoryDto } from '../../models/api.types';
import { categoryDescendantSlugs } from '../../core/utils/category-tree.util';
import { getImageUrl } from '../../core/utils/image-url.util';
import { filter, map, merge, of, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatExpansionModule,
    AsyncPipe,
    NgTemplateOutlet,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly categoriesApi = inject(CategoryService);
  private readonly cartApi = inject(CartService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly getImageUrl = getImageUrl;

  readonly categories$ = this.categoriesApi.activeTree();

  readonly cartCount$ = this.cartApi.cartChanges.pipe(
    map((c) => c?.totalQuantity ?? 0),
    startWith(0)
  );

  readonly mobileMenuOpen = signal(false);
  readonly isLoggedIn = signal(this.auth.isAuthenticated());

  readonly activeSlug = toSignal(
    merge(
      of(this.router.url),
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map(() => this.router.url)
      )
    ).pipe(map((url) => this.categorySlugFromUrl(url))),
    { initialValue: this.categorySlugFromUrl(this.router.url) }
  );

  isBranchActive(node: CategoryDto): boolean {
    const slug = this.activeSlug();
    if (!slug) {
      return false;
    }
    return categoryDescendantSlugs(node).includes(slug);
  }

  isLeafActive(slug: string): boolean {
    return this.activeSlug() === slug;
  }

  openMobileMenu(ev: Event): void {
    ev.stopPropagation();
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onMobileNavLinkClick(ev: Event): void {
    ev.stopPropagation();
    this.closeMobileMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  private categorySlugFromUrl(url: string): string | null {
    const m = url.match(/\/category\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  onAdminClick(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/admin/dashboard');
    } else {
      this.router.navigateByUrl('/admin/login');
    }
  }
}
