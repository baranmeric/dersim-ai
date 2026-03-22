import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ComponentType } from '@angular/cdk/portal';
import { LayoutService } from '@org/core';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly layoutService = inject(LayoutService);

  open<T>(component: ComponentType<T>): void {
    if (this.layoutService.isMobile()) {
      this.bottomSheet.open(component, {
        panelClass: 'app-bottom-sheet-panel',
      });
    } else {
      this.dialog.open(component, {
        width: '44rem',
        panelClass: 'app-dialog-panel',
      });
    }
  }
}
