import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { ConfirmDeleteDialogComponent, ConfirmDeleteDialogData } from './confirm-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDeleteDialogService {
  private readonly dialog = inject(MatDialog);

  confirm(data: ConfirmDeleteDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDeleteDialogComponent, {
        width: 'min(100vw - 32px, 420px)',
        data,
        autoFocus: 'dialog',
        restoreFocus: true,
      })
      .afterClosed()
      .pipe(map((r) => r === true));
  }
}
