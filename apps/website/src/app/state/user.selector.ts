import { createFeatureSelector } from "@ngrx/store";
import { IUserDto } from "shared/model/user.model";

export const selectUserState = createFeatureSelector<Readonly<IUserDto | null>>('user');