import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IUserDto } from '@dersim/shared';

export const UserAction = createActionGroup({
  source: 'User',
  events: {
    setUser: props<{ user: IUserDto }>(),
    resetUser: emptyProps(),
  },
});
