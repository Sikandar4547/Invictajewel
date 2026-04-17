import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDeleteDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="!m-0 !font-display !text-xl text-app-ink">{{ data.title }}</h2>
    <mat-dialog-content class="!text-app-ink-muted !text-sm !leading-relaxed !pt-2">
      <p class="m-0">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pt-2 !gap-2">
      <button type="button" mat-stroked-button class="border-app-border text-app-ink" (click)="ref.close(false)">Cancel</button>
      <button type="button" mat-flat-button color="warn" (click)="ref.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDeleteDialogComponent {
  readonly ref = inject(MatDialogRef<ConfirmDeleteDialogComponent, boolean>);
  readonly data = inject<ConfirmDeleteDialogData>(MAT_DIALOG_DATA);
}
