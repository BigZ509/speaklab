import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createApp, type SessionStore, type TokenVerifier } from './app.js';

if (!getApps().length) initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const collection = db.collection('sessions');

const store: SessionStore = {
  async create(data) {
    const ref = collection.doc();
    const session = { id: ref.id, ...data };
    await ref.set(session);
    return session;
  },
  async find(id) {
    const doc = await collection.doc(id).get();
    return doc.exists ? (doc.data() as Awaited<ReturnType<SessionStore['create']>>) : null;
  }
};

const verifier: TokenVerifier = {
  async verify(token) {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  }
};

const port = Number(process.env.PORT ?? 3000);
createApp(store, verifier).listen(port, () => console.log(`SpeakLab API listening on :${port}`));
