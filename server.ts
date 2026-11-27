import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import healthHandler from './api/health.ts';
import psiHandler from './api/psi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer(): Promise<void> {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/api/health', async (req, res) => {
    await healthHandler(
      {
        method: req.method,
        query: req.query as Record<string, string | string[] | undefined>,
      },
      res
    );
  });

  app.get('/api/psi', async (req, res) => {
    await psiHandler(
      {
        method: req.method,
        query: req.query as Record<string, string | string[] | undefined>,
      },
      res
    );
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SG Haze Watch server running on http://0.0.0.0:${port}`);
  });
}

void startServer();
