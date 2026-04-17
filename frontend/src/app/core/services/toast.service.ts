import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, options?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['toast-success'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      ...options
    });
  }

  error(message: string, options?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['toast-error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      ...options
    });
  }

  warning(message: string, options?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['toast-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      ...options
    });
  }

  info(message: string, options?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['toast-info'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      ...options
    });
  }

  dismissAll(): void {
    this.snackBar.dismiss();
  }
}
