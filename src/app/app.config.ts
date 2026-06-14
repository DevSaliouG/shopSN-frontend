import { ApplicationConfig, provideZoneChangeDetection, InjectionToken } from '@angular/core';
import { provideRouter, withViewTransitions, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { jwtInterceptor } from './features/interceptors/jwt.interceptor';
import { errorInterceptor } from './features/interceptors/error.interceptor';

// Token d'injection pour l'environnement
export const ENVIRONMENT = new InjectionToken<typeof environment>('environment');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    provideRouter(
      routes,
      withViewTransitions(),
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    
    provideClientHydration(),
    
    // Injection de l'environnement
    { provide: ENVIRONMENT, useValue: environment }
  ]
};
