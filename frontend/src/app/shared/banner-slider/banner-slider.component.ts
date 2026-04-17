import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { BannerDto } from '../../models/api.types';
import { getImageUrl } from '../../core/utils/image-url.util';

@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (banners?.length; as len) {
      <section class="ij-banner-fullbleed relative bg-app-bg text-app-ink border-b border-app-border">
        <div class="relative w-full aspect-[21/9] min-h-[200px] md:min-h-[280px] lg:aspect-[24/9]">
          @for (b of banners!; track b.id; let i = $index) {
            <a
              [href]="resolveHref(b.linkUrl)"
              target="_blank"
              rel="noopener noreferrer"
              class="absolute inset-0 block transition-opacity duration-700 ease-out"
              [class.opacity-100]="i === activeIndex()"
              [class.opacity-0]="i !== activeIndex()"
              [class.pointer-events-none]="i !== activeIndex()"
              [attr.aria-hidden]="i !== activeIndex()"
            >
              <div class="absolute inset-0 overflow-hidden bg-app-field">
                <img
                  [src]="getImageUrl(b.imageUrl)"
                  [alt]="b.title || 'Banner'"
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-cover object-center will-change-transform"
                  [class.ij-banner-kb-active]="i === activeIndex()"
                />
              </div>
              <div
                class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/45 pointer-events-none"
                aria-hidden="true"
              ></div>
              <div
                class="absolute inset-x-0 top-0 z-10 px-4 py-6 md:px-12 md:py-10 text-center pointer-events-none"
              >
                <p
                  class="text-white/95 text-[1.25rem] tracking-[0.35em] uppercase font-semibold mb-2 md:mb-4 drop-shadow"
                  style="line-height: 1rem"
                >
                  INVICTA BY MAHGUL
                </p>
                <p class="text-white text-[1.25rem] leading-[1.25rem] drop-shadow-lg max-w-4xl mx-auto">
                  {{ b.title }}
                </p>
              </div>
            </a>
          }
        </div>

        @if (len > 1) {
          <!-- Previous Button -->
          <button
            (click)="prev()"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <span class="text-xl leading-none">‹</span>
          </button>

          <!-- Next Button -->
          <button
            (click)="next()"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
            aria-label="Next banner"
          >
            <span class="text-xl leading-none">›</span>
          </button>

          <!-- Indicator Dots -->
          <div class="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
            @for (_ of banners!; track $index; let i = $index) {
              <span
                class="h-2 rounded-full transition-all pointer-events-auto"
                [ngClass]="i === activeIndex() ? 'bg-white w-6' : 'bg-white/50 w-2'"
                aria-hidden="true"
              ></span>
            }
          </div>
        }
      </section>
    }
  `,
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  @Input() banners: BannerDto[] | null = null;

  protected readonly getImageUrl = getImageUrl;

  private timer: number | null = null;
  private readonly prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  readonly activeIndex = signal(0);

  ngOnInit(): void {
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  resolveHref(linkUrl: string): string {
    const v = (linkUrl ?? '').trim();
    if (!v) return '/';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('/')) {
      return typeof window !== 'undefined' ? `${window.location.origin}${v}` : v;
    }
    return v;
  }

  next() {
    const total = this.banners?.length ?? 0;
    if (total <= 1) return;
    this.activeIndex.set((this.activeIndex() + 1) % total);
    this.restart();
  }

  prev() {
    const total = this.banners?.length ?? 0;
    if (total <= 1) return;
    this.activeIndex.set((this.activeIndex() - 1 + total) % total);
    this.restart();
  }

  private start() {
    if (this.prefersReducedMotion) return;
    const total = this.banners?.length ?? 0;
    if (total <= 1) return;
    this.timer = window.setInterval(() => this.next(), 5000);
  }

  private stop() {
    if (this.timer != null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private restart() {
    this.stop();
    this.start();
  }
}
