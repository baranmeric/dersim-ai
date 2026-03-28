import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { LayoutService } from '@dersim/website/core';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly layoutService = inject(LayoutService);

  open<T, R = unknown>(component: ComponentType<T>): Observable<R> {
    if (this.layoutService.isMobile()) {
      return this.bottomSheet.open(component, {
        panelClass: 'app-bottom-sheet-panel',
      }).afterDismissed();
    } else {
      return this.dialog.open(component, {
        width: '44rem',
        panelClass: 'app-dialog-panel',
      }).afterClosed();
    }
  }
}
