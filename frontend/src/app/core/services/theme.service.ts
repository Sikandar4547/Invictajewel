import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private readonly systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

  private readonly theme$ = signal<Theme>(this.getInitialTheme());
  
  public isDarkMode = computed(() => {
    const theme = this.theme$();
    if (theme === 'system') {
      return this.systemDarkMode.matches;
    }
    return theme === 'dark';
  });

  public currentTheme = computed(() => this.theme$());

  constructor() {
    // Listen to system preference changes
    this.systemDarkMode.addEventListener('change', () => {
      this.applyTheme();
    });

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

  /**
   * Toggle between light and dark modes
   */
  public toggleDarkMode(): void {
    const currentTheme = this.theme$();
    if (currentTheme === 'light') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  /**
   * Apply the theme to the document
   */
  private applyTheme(): void {
    const isDark = this.isDarkMode();
    const html = document.documentElement;

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  /**
   * Get the initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.storageKey) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }

    // Default to system preference
    return 'system';
  }
}
