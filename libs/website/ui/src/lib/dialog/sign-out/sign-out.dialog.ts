import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { BaseDialog } from '../../component/base-dialog/base.dialog';

@Component({
  selector: 'app-sign-out-dialog',
  standalone: true,
  imports: [BaseDialog],
  templateUrl: './sign-out.dialog.html',
  styleUrls: ['./sign-out.dialog.scss'],
})
export class SignOutDialog {
  private readonly dialogRef = inject<MatDialogRef<SignOutDialog>>(MatDialogRef, { optional: true });
  private readonly bottomSheetRef = inject<MatBottomSheetRef<SignOutDialog>>(MatBottomSheetRef, { optional: true });

  protected close(): void {
    this.dialogRef?.close(false);
    this.bottomSheetRef?.dismiss(false);
  }

  protected confirm(): void {
    this.dialogRef?.close(true);
    this.bottomSheetRef?.dismiss(true);
  }
}
