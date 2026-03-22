import { HttpClient, HttpDownloadProgressEvent, HttpEventType } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, scan } from 'rxjs';
import { EnvironmentService } from 'src/app/service/core/environment.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly httpClient = inject(HttpClient);
  private readonly API_URL = inject(EnvironmentService).apiUrl;

  private createUrl(paths: Array<string>): string {
    let fullPath = '';
    for (let path of paths) {
      fullPath += `/${path}`;
    }
    return `${this.API_URL}${fullPath}`;
  }

  get<T>(paths: Array<string>): Observable<T> {
    const url = this.createUrl(paths);
    return this.httpClient.get<T>(url, { withCredentials: true });
  }

  post<ResponseT, BodyT>(paths: Array<string>, body: BodyT): Observable<ResponseT> {
    const url = this.createUrl(paths);
    return this.httpClient.post<ResponseT>(url, body, { withCredentials: true });
  }

  delete<T>(paths: Array<string>): Observable<T> {
    const url = this.createUrl(paths);
    return this.httpClient.delete<T>(url, { withCredentials: true });
  }

  patch<ResponseT, BodyT>(paths: Array<string>, body: BodyT): Observable<ResponseT> {
    const url = this.createUrl(paths);
    return this.httpClient.patch<ResponseT>(url, body, { withCredentials: true });
  }

  stream(paths: Array<string>, body?: any): Observable<string> {
    const url = this.createUrl(paths);
    return this.httpClient.post(url, body, {
      params: { stream: 'true' },
      responseType: 'text',
      observe: 'events',
      reportProgress: true,
      withCredentials: true,
    }).pipe(
    filter(event => event.type === HttpEventType.DownloadProgress),
    map(event => (event as HttpDownloadProgressEvent).partialText ?? ''),
    distinctUntilChanged(),
  );
  }
}
