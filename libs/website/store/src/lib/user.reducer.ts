import { createReducer, on } from '@ngrx/store';
import { IUserDto } from '@dersim/shared';
import { UserAction } from './user.action';

const initialState: Readonly<IUserDto | null> = null;

export const userReducer = createReducer<IUserDto | null>(
  initialState,
  on(UserAction.setUser, (_state, { user }) => user),
  on(UserAction.resetUser, () => null),
);
