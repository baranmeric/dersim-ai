import { HttpEvent, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppError, AppErrorType } from '@org/shared';

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const appError = AppError.fromError((error as { error?: unknown })?.error);
      console.error('[HTTP Error]', appError.statusCode, appError.message, appError.errorType);
      switch (appError.errorType) {
        case AppErrorType.UNAUTHORIZED:
          router.navigate(['authenticate']);
          break;
        default:
          break;
      }
      return throwError(() => appError);
    }),
  );
}
