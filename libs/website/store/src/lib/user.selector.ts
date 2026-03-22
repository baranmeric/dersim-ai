import { createFeatureSelector } from '@ngrx/store';
import { IUserDto } from '@dersim/shared';

export const selectUserState = createFeatureSelector<Readonly<IUserDto | null>>('user');
