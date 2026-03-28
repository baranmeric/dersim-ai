import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserDto, IUserRequest } from '@dersim/shared';
import { HttpService } from '@dersim/website/core';

@Injectable({ providedIn: 'root' })
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
