import { createReducer, on } from "@ngrx/store";
import { IUserDto } from "shared/model/user.model";
import { UserAction } from "./user.action";

const initalState: Readonly<IUserDto | null> = null;

export const userReducer = createReducer<IUserDto | null>(
    initalState,
    on(UserAction.setUser, (_state, { user }) => user),
    on(UserAction.resetUser, () => null),
);