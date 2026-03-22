import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export enum SnackbarType {
  success = 'success',
  error = 'error',
  info = 'info',
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackbar = inject(MatSnackBar);

  private show(message: string, type: SnackbarType, config?: MatSnackBarConfig): void {
    this.snackbar.open(message, 'Dismiss', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`snackbar-${type}`],
      ...config,
    });
  }

  success(message: string, config?: MatSnackBarConfig): void {
    this.show(message, SnackbarType.success, config);
  }

  error(message: string, config?: MatSnackBarConfig): void {
    this.show(message, SnackbarType.error, config);
  }

  info(message: string, config?: MatSnackBarConfig): void {
    this.show(message, SnackbarType.info, config);
  }
}
