import { inject, Injectable, signal } from '@angular/core';
import { NotificationType } from 'shared/enum/notificationType';
import { SessionNotification } from 'shared/model/notification.model';
import { ISessionListItem } from 'shared/model/session.model';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: WebSocket;
  private readonly wsUrl = inject(EnvironmentService).wsUrl;

  readonly latestSessionUpdate = signal<ISessionListItem | null>(null);

  connect(): void {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onmessage = (event: MessageEvent) => {
      const notification = JSON.parse(event.data as string);
      if (notification.type === NotificationType.SESSION_UPDATE) {
        this.latestSessionUpdate.set((notification as SessionNotification).session);
      }
    };
  }

  disconnect(): void {
    this.socket?.close();
  }
}
