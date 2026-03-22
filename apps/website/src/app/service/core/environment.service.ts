import { inject, Injectable } from '@angular/core';
import { ENV_CONFIG, IAppEnvironment } from 'src/environment/app-environment';
import { environment as devEnvironment } from 'src/environment/environment.dev';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly config: IAppEnvironment = inject(ENV_CONFIG);

  readonly production = this.config.production;
  readonly apiUrl = this.config.apiUrl || devEnvironment.apiUrl;
  readonly wsUrl = this.config.wsUrl || devEnvironment.wsUrl;
}
