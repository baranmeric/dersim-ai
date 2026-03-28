import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap } from 'rxjs';
import { UserAction } from '@dersim/website/store';
import { UserService } from '../service/user.service';

@Injectable()
export class UserEffect {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserAction.logout),
        exhaustMap(async () => {
          await this.userService.logout();
          await this.router.navigate(['/authenticate']);
        }),
      ),
    { dispatch: false },
  );
}
