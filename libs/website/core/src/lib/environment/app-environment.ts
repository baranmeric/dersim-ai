import { InjectionToken } from '@angular/core';

export interface IAppEnvironment {
  production: boolean;
  apiUrl: string;
  wsUrl: string;
}

export const ENV_CONFIG = new InjectionToken<IAppEnvironment>('ENV_CONFIG');
