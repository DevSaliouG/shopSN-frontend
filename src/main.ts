import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// Service Worker désactivé temporairement (cause des problèmes de cache)
// if ('serviceWorker' in navigator && !location.hostname.includes('localhost')) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         console.log('[SW] Enregistré:', registration.scope);
//       })
//       .catch((error) => {
//         console.error('[SW] Échec enregistrement:', error);
//       });
//   });
// }
