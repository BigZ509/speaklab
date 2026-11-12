import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp, type Session, type SessionStore, type TokenVerifier } from '../src/app.js';

let records: Map<string, Session>;
let nextId: number;
let fails: boolean;
const verifier: TokenVerifier = {
  async verify(token) {
    if (token === 'alice') return 'alice-uid';
    if (token === 'bob') return 'bob-uid';
    throw new Error('invalid token');
  }
};
const store: SessionStore = {
  async create(data) {
    if (fails) throw new Error('database unavailable');
    const session = { id: `session-${++nextId}`, ...data };
    records.set(session.id, session);
    return session;
  },
  async find(id) {
    if (fails) throw new Error('database unavailable');
    return records.get(id) ?? null;
  }
};
const app = createApp(store, verifier);
const asAlice = () => ({ Authorization: 'Bearer alice' });
const asBob = () => ({ Authorization: 'Bearer bob' });

beforeEach(() => { records = new Map(); nextId = 0; fails = false; });

describe('Week 2 session API', () => {
  it('creates a session owned by verified user, ignoring client ownership attempts', async () => {
    const res = await request(app).post('/sessions').set(asAlice()).send({ questionId: 'q001' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'session-1', userId: 'alice-uid', status: 'created', questionId: 'q001' });
  });
  it('gets an owned session', async () => {
    await request(app).post('/sessions').set(asAlice()).send({ questionId: 'q001' });
    const res = await request(app).get('/sessions/session-1').set(asAlice());
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('alice-uid');
  });
  it('prevents another user from reading the session', async () => {
    await request(app).post('/sessions').set(asAlice()).send({ questionId: 'q001' });
    const res = await request(app).get('/sessions/session-1').set(asBob());
    expect(res.status).toBe(404);
  });
  it('rejects missing authorization', async () => {
    expect((await request(app).get('/sessions/session-1')).status).toBe(401);
  });
  it('rejects invalid authorization', async () => {
    expect((await request(app).get('/sessions/session-1').set('Authorization', 'Bearer invalid')).status).toBe(401);
  });
  it('rejects invalid or unexpected payload properties', async () => {
    expect((await request(app).post('/sessions').set(asAlice()).send({ questionId: '' })).status).toBe(400);
    expect((await request(app).post('/sessions').set(asAlice()).send({ questionId: 'q001', userId: 'bob-uid' })).status).toBe(400);
  });
  it('responds with 404 to an unknown session', async () => {
    expect((await request(app).get('/sessions/nope').set(asAlice())).status).toBe(404);
  });
  it('returns a sanitized 500 on database failure', async () => {
    fails = true;
    const res = await request(app).post('/sessions').set(asAlice()).send({ questionId: 'q001' });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'INTERNAL_SERVER_ERROR' });
  });
});
