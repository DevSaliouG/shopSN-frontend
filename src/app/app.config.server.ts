import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { appConfig } from './app.config';
import { ENVIRONMENT } from './core/tokens/environment.token';
import { serverRoutes } from './app.routes.server';
import { environment } from '../environments/environment';

const SSR_API_URL =
  (typeof process !== 'undefined' && process.env['API_URL'])
    ? process.env['API_URL']
    : 'http://127.0.0.1:8000';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideNoopAnimations(), // Disable animations in SSR (no-op implementation)
    {
      provide: ENVIRONMENT,
      useValue: {
        ...environment,
        // En SSR, une URL API absolue évite les requêtes relatives vers le dev server
        // (localhost:4200) qui peuvent boucler et empêcher la stabilisation.
        apiUrl: SSR_API_URL,
      }
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
