import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  isMobile = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map(r => r.matches)),
    { initialValue: false }
  );

  isTablet = toSignal(
    this.breakpointObserver
      .observe(Breakpoints.Tablet)
      .pipe(map(r => r.matches)),
    { initialValue: false }
  );
}
