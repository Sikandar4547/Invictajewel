import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private readonly theme$ = signal<Theme>('light');

  public isDarkMode = computed(() => false);

  public currentTheme = computed(() => this.theme$());

  constructor() {
    // Apply initial theme
    this.applyTheme();
  }

  /**
   * Set the theme explicitly
   */
  public setTheme(theme: Theme): void {
    this.theme$.set(theme);
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme();
  }

  public toggleDarkMode(): void {
    this.setTheme('light');
  }

  /**
   * Apply the theme to the document
   */
  private applyTheme(): void {
    const html = document.documentElement;
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
  }

  /**
   * Get the initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    return 'light';
  }
}
