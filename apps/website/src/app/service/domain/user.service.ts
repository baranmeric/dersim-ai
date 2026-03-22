import { inject, Injectable } from '@angular/core';
import { UserHttpService } from '../http/user-http.service';
import { SocketService } from '../core/socket.service';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserAction } from '../../state/user.action';
import { IUserRequest } from 'shared/model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly userHttpService = inject(UserHttpService);
  private readonly socketService = inject(SocketService);
  private readonly store = inject(Store);

  async refreshUser(): Promise<void> {
    try {
      const user = await firstValueFrom(this.userHttpService.checkStatus());
      this.store.dispatch(UserAction.setUser({ user }));
      this.socketService.connect();
    } catch {
      this.store.dispatch(UserAction.resetUser());
    }
  }

  async login(request: IUserRequest): Promise<void> {
    const user = await firstValueFrom(this.userHttpService.login(request));
    this.store.dispatch(UserAction.setUser({ user }));
    this.socketService.connect();
  }

  async register(request: IUserRequest): Promise<void> {
    const user = await firstValueFrom(this.userHttpService.register(request));
    this.store.dispatch(UserAction.setUser({ user }));
    this.socketService.connect();
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.userHttpService.logout());
    this.store.dispatch(UserAction.resetUser());
    this.socketService.disconnect();
  }
}
