import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig, ENVIRONMENT } from './app.config';
import { serverRoutes } from './app.routes.server';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: ENVIRONMENT,
      useValue: {
        ...environment,
        // En SSR (Node.js dans le conteneur), localhost:8000 pointe sur le conteneur
        // lui-même. On utilise le nom de service Docker "backend" à la place.
        apiUrl: (typeof process !== 'undefined' && process.env['API_URL'])
          ? process.env['API_URL']
          : environment.apiUrl
      }
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
