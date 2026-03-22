import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { ENV_CONFIG } from 'src/environment/app-environment';
import { environment } from 'src/environment/environment.dev';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { userReducer } from './state/user.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './service/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ENV_CONFIG, useValue: environment },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
        user: userReducer,
    }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
]
};
