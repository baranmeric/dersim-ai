import { inject, Injectable } from '@angular/core';
import { ENV_CONFIG, IAppEnvironment } from '../../../../libs/website/core/src/lib/environment/app-environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly config: IAppEnvironment = inject(ENV_CONFIG);

  readonly production = this.config.production;
  readonly apiUrl = this.config.apiUrl;
  readonly wsUrl = this.config.wsUrl;
}
