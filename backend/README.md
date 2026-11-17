# SpeakLab 2.0 — Friend A Week 2 backend starter

This is a standalone TypeScript/Express example for the Week 2 tasks in the SpeakLab playbook. **It is not a replacement for an existing Railway backend**, which must be inspected and merged into carefully. No repository files were changed.

## Included
- POST `/sessions`: authenticated creation of metadata, using verified token UID
- GET `/sessions/:id`: returns a session only to its owner (404 for absent/not-owned)
- Firestore `sessions` document shape: id, userId, questionId, createdAt, status, transcript, metrics, version
- Safe 400/401/404/500 API responses, tests with injected fake dependencies
- `GET /health` for a deployment smoke test

## Local setup
Requires Node.js 20+, a Firebase project with Firestore, and **server-side** Firebase Admin credentials.

```bash
npm install
npm run build
npm test
```

For real Firestore access, set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to a securely stored service account file (outside the repo), or use platform-provided application default credentials. Set `GOOGLE_CLOUD_PROJECT` if necessary. Set `PORT` for Railway. Then:

```bash
npm run dev
```

Never put service account JSON or OpenAI keys in the repository or mobile app.

## Request examples
Obtain a **real Firebase ID token** from the signed-in Expo app (the Firebase JS SDK exposes `user.getIdToken()`). Do not use a Firebase API key as a bearer token.

```bash
curl -i -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"questionId":"behavioral-001"}'

curl -i http://localhost:3000/sessions/REPLACE_SESSION_ID \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN"
```

**Important:** Test with two genuine Firebase users. Creating with user A and retrieving with user B must yield `404 SESSION_NOT_FOUND`. The fake `alice`/`bob` tokens in automated tests are injected stand-ins and never work in production.

## Design choices and follow-up
- The server stores an ISO-8601 `createdAt` string for easy JSON compatibility. Consider switching to Firestore server timestamps when integrating with a defined existing schema.
- `questionId` is the only client-writeable field in Week 2. Other fields are server-defined.
- In Week 3, add results persistence, pagination and stronger validation; do not extend API behavior without updating the shared contract.
- The Firebase Admin SDK is privileged and bypasses Firestore Security Rules. API ownership checks are mandatory even if client security rules exist. Restrict Firestore client access separately, and never ship admin credentials to Expo.
- For actual integration into the current SpeakLab system, first locate the separate Railway backend and its deployment settings, and retain the existing `/transcribe` route.
- This starter's tests mock the Firestore adapter and token verification; before deployment add Firebase emulator integration tests and test against the actual backend.

## Review checklist
- [ ] Verify real Firebase token against correct project
- [ ] Confirm saved `userId` comes from verified token, not client
- [ ] Run tests and typecheck
- [ ] Demo success, bad payload, missing token, wrong owner, server error
- [ ] Post PR with curl examples, test logs and no private data
