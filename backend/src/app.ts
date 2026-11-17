import express, { type ErrorRequestHandler } from 'express';
import { z } from 'zod';

export type Session = {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
  status: 'created' | 'processing' | 'done' | 'failed';
  transcript: string;
  metrics: Record<string, unknown> | null;
  version: number;
};

export interface SessionStore {
  create(data: Omit<Session, 'id'>): Promise<Session>;
  find(id: string): Promise<Session | null>;
}

export interface TokenVerifier {
  verify(token: string): Promise<string>; // returns trusted Firebase uid
}

const createSchema = z.object({ questionId: z.string().trim().min(1).max(128) }).strict();

export function createApp(store: SessionStore, verifier: TokenVerifier) {
  const app = express();
  app.use(express.json({ limit: '16kb' }));

  app.use(async (req, res, next) => {
    if (req.path === '/health') return next();
    const header = req.header('authorization');
    const match = /^Bearer (\S+)$/i.exec(header ?? '');
    if (!match) { res.status(401).json({ error: 'UNAUTHORIZED' }); return; }
    try {
      res.locals.uid = await verifier.verify(match[1]);
      next();
    }
    catch (error) {
  console.error(
    "Firebase verification error:",
    error instanceof Error ? error.message : String(error)
  );

  res.status(401).json({
    error: "UNAUTHORIZED"
  });
}
  });

  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

  app.post('/sessions', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'INVALID_PAYLOAD' }); return; }
    const session = await store.create({
      userId: res.locals.uid as string,
      questionId: parsed.data.questionId,
      createdAt: new Date().toISOString(),
      status: 'created', transcript: '', metrics: null, version: 1
    });
    res.status(201).json(session);
  });

  app.get('/sessions/:id', async (req, res) => {
    const id = String(req.params.id);
    const session = await store.find(id);
    // Return the same response for missing and not-owned records to avoid exposing their existence.
    if (!session || session.userId !== res.locals.uid) {
      res.status(404).json({ error: 'SESSION_NOT_FOUND' }); return;
    }
    res.json(session);
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) { next(error); return; }
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'INVALID_JSON' }); return;
    }
    if (typeof error?.status === 'number' && error.status === 413) {
      res.status(413).json({ error: 'PAYLOAD_TOO_LARGE' }); return;
    }
    console.error('Request failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  };
  app.use(errorHandler);
  return app;
}
