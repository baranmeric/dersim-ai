import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ISessionDto, ISessionListItem } from '@dersim/shared';
import { HttpService } from '@dersim/website/core';

@Injectable({ providedIn: 'root' })
export class SessionHttpService {
  private readonly httpService = inject(HttpService);

  async getSessions(): Promise<Array<ISessionListItem>> {
    return firstValueFrom(this.httpService.get(['session']));
  }

  async getSession(sessionId: string): Promise<ISessionDto> {
    return firstValueFrom(this.httpService.get(['session', sessionId]));
  }

  async createSession(): Promise<ISessionDto> {
    return firstValueFrom(this.httpService.post(['session'], {}));
  }

  async deleteSession(sessionId: string): Promise<ISessionDto> {
    return firstValueFrom(this.httpService.delete(['session', sessionId]));
  }
}
