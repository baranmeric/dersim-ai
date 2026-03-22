import { createFeatureSelector } from '@ngrx/store';
import { IUserDto } from '@org/shared';

export const selectUserState = createFeatureSelector<Readonly<IUserDto | null>>('user');
