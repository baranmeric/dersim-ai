import { inject, Injectable } from '@angular/core';
import { HttpService } from '@dersim/website/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatHttpService {
  private readonly httpService = inject(HttpService);

  streamChat(sessionId: string, content: string): Observable<string> {
    return this.httpService.stream(['chat', sessionId], { content });
  }
}
