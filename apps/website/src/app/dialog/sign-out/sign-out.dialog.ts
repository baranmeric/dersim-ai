import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/domain/user.service';
import { BaseDialog } from 'src/app/dialog/base/base.dialog';

@Component({
  selector: 'app-sign-out-dialog',
  standalone: true,
  imports: [BaseDialog],
  templateUrl: './sign-out.dialog.html',
  styleUrls: ['./sign-out.dialog.scss'],
})
export class SignOutDialog {

  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly dialogRef = inject<MatDialogRef<SignOutDialog>>(MatDialogRef, { optional: true });
  private readonly bottomSheetRef = inject<MatBottomSheetRef<SignOutDialog>>(MatBottomSheetRef, { optional: true });
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected readonly loading = signal(false);

  // ── Methods ──────────────────────────────────────────────────────────────────────
  protected close(): void {
    this.dialogRef?.close();
    this.bottomSheetRef?.dismiss();
  }

  protected async onConfirm(): Promise<void> {
    this.loading.set(true);
    await this.userService.logout();
    this.router.navigate(['/authenticate']);
    this.close();
  }
}
