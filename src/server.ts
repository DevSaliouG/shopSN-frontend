import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Proxy API requests to Laravel backend (SSR compatibility)
 * Uses environment variable API_URL or falls back to localhost for development
 */
const API_BACKEND_URL = process.env['API_URL'] || 'http://127.0.0.1:8000';

app.use('/api', async (req, res) => {
  const backendUrl = `${API_BACKEND_URL}${req.originalUrl}`;

  try {
    // Préparer les headers en excluant ceux qui causent des problèmes
    const headers: Record<string, string> = {};
    Object.keys(req.headers).forEach(key => {
      const value = req.headers[key];
      // Exclure les headers de connexion et host
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase()) && typeof value === 'string') {
        headers[key] = value;
      }
    });

    // Ajouter le bon host
    headers['host'] = new URL(API_BACKEND_URL).host;

    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body ? JSON.stringify(req.body) : undefined,
    });

    // Copier les headers de réponse
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('SSR API Proxy Error:', backendUrl, error);
    res.status(503).json({ error: 'Backend unavailable during SSR' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
