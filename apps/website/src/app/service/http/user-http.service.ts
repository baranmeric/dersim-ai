import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { IAuthData, IUserDto, IUserRequest } from 'shared/model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserHttpService {
  private readonly httpService = inject(HttpService);

  checkStatus(): Observable<IUserDto> {
    return this.httpService.get(['user', 'status']);
  }

  login(request: IUserRequest): Observable<IUserDto> {
    return this.httpService.post(['user', 'login'], request);
  }

  register(request: IUserRequest): Observable<IUserDto> {
    return this.httpService.post(['user', 'register'], request);
  }

  logout(): Observable<IUserDto> {
    return this.httpService.post(['user', 'logout'], {});
  }
}
