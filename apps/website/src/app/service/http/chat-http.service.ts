import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class ChatHttpService {
  private readonly httpService = inject(HttpService);

  streamChat(sessionId: string, content: string): Observable<string> {
    return this.httpService.stream(['chat', sessionId], { content });
  }
}
