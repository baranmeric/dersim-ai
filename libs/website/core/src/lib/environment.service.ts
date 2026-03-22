import { inject, Injectable } from '@angular/core';
import { ENV_CONFIG, IAppEnvironment } from './app-environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly config: IAppEnvironment = inject(ENV_CONFIG);

  readonly production = this.config.production;
  readonly apiUrl = this.config.apiUrl;
  readonly wsUrl = this.config.wsUrl;
}
