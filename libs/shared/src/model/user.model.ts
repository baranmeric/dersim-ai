export interface IUserDto {
    id: string;
    name: string;
}

export interface IUserRequest {
    name: string;
    password: string;
}

export interface IAuthData {
    user: IUserDto;
    token: string;
}
