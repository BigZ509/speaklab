# SpeakLab — Transcription API Contract v1

**GitHub Issue:** #9 — Verify `/transcribe` API contract, authentication, and storage boundaries
**Contract version:** 1.0 (documentation of current behavior)
**Status:** Partially verified — security and retention gaps identified
**Last reviewed:** November 17, 2026

## 1. Overview

The SpeakLab mobile application sends recorded audio to a separate Node.js/Express backend deployed on Railway. The backend uses Multer to receive audio and OpenAI's `whisper-1` model to generate text with word-level timestamps.

**Backend repository:** `BigZ509/speaklab-backend`
**Deployment branch:** `main`
**Production endpoint:** `https://speaklab-backend-production.up.railway.app/transcribe`

This API is separate from the `/sessions` endpoints implemented in SpeakLab PR #31.

## 2. Request Contract

**Method:** `POST`
**Path:** `/transcribe`
**Content type:** `multipart/form-data`

### Required field

| Field | Type | Description |
|---|---|---|
| `audio` | File | Audio recording uploaded by the mobile application |

The mobile client currently supplies the filename `recording.m4a`.

Example using a synthetic, non-private test recording:

```bash
curl -i -X POST \
  https://speaklab-backend-production.up.railway.app/transcribe \
  -F "audio=@test-recording.m4a"
```

**Authentication — current state:** The inspected Express route does not verify Firebase ID tokens and does not enforce user ownership. The current mobile client also does not explicitly attach a Bearer token to this request.

Authentication is therefore a known security gap, not a supported guarantee of this v1 endpoint.

## 3. Response Contract

### Successful transcription — expected to be HTTP 200

The server returns JSON containing `text` and `words`.

Illustrative mock response (not captured from a successful production request):

```json
{
  "text": "I enjoy learning software engineering.",
  "words": [
    {
      "word": "I",
      "start": 0.0,
      "end": 0.2
    },
    {
      "word": "enjoy",
      "start": 0.2,
      "end": 0.6
    }
  ]
}
```

The mobile client expects:

- `text`: a string containing the transcription.
- `words`: an array of objects with `word` (string), `start` (number), and `end` (number).

The mobile client also validates that timestamps are finite, nonnegative, and ordered so that `end >= start`.

The precise successful response has not yet been verified against Railway using a test recording.

### Missing audio — HTTP 400

**Live verified on Railway.**

Content type: `text/html; charset=utf-8`

Response body:

```text
No audio file uploaded
```

The same HTTP 400 response was observed with no Authorization header and with an invalid Bearer token, when no audio was supplied.

### Transcription exception — HTTP 500

**Derived from source code; not yet reproduced on Railway.**

Content type: JSON

```json
{
  "error": "Transcription failed"
}
```

The handler currently uses this response for exceptions during transcription and does not provide a distinct documented transient-failure status.

### Other responses

Invalid file types, oversized uploads, upstream throttling, and infrastructure errors do not yet have a fully verified contract.

## 4. Authentication and Security Findings

1. The inspected `POST /transcribe` route has no Firebase token-verification middleware.
2. No user identity or recording-ownership verification occurs in the route.
3. The OpenAI API key is obtained from the server environment through `OPENAI_API_KEY`, rather than being passed by the mobile client.
4. The server does not explicitly validate audio MIME type, file extension, or file size.
5. Multer memory storage is configured without an explicit upload size limit.
6. Full transcription results and file metadata are currently written to server logs.

**Recommended follow-up:** Require authenticated requests, enforce appropriate ownership, set upload limits, validate media, and remove sensitive production logging. Changes should be coordinated with the mobile team because adding authentication will affect the client request contract.

## 5. Storage and Privacy Boundaries

### What the inspected code establishes

- Multer receives uploaded audio into server memory.
- The audio buffer is sent to OpenAI for transcription.
- The transcription is returned to the caller.
- The inspected route does not explicitly save uploaded audio or transcripts to a database or local disk.
- Transcription data and file information are logged by the backend.

### What remains unknown

- Whether external services or the transcription provider retain submitted audio or generated transcripts, and for how long.
- Railway application-log retention and access controls.
- Whether other application components store copies of audio or transcripts.
- The team's intended retention and deletion policy.

These unknowns require follow-up verification. Memory-only upload handling does not prove end-to-end data deletion.

## 6. Verification Evidence

| Test | Result | Evidence |
|---|---|---|
| Endpoint discovered | Confirmed | `index.js`, line 18 |
| Audio upload field | `audio` | `upload.single('audio')` |
| Whisper integration | `whisper-1` | `index.js`, lines 33–39 |
| Missing audio, no token | HTTP 400 | Live Railway request |
| Missing audio, invalid token | HTTP 400 | Live Railway request |
| Successful audio transcription | Pending | Requires synthetic test recording |
| Transcription exception | Pending | Source-defined HTTP 500 |
| Ownership enforcement | Not implemented in inspected route | Source review |

No private recordings, Firebase ID tokens, or OpenAI API credentials are included in this document.

## 7. Mobile Integration Notes

The mobile client implementation is located in `services/transcription-services.ts`.

It uploads the audio field as multipart form data and expects `{ text, words }` in the successful JSON response.

Mobile developers can use sanitized mock fixtures for successful transcription and error handling. They should not treat current authentication behavior as an approved production security design.

### Mock response fixtures

The following sanitized fixtures are available for mobile
integration testing:

- `docs/api/fixtures/transcribe-success.json`
  - Illustrative successful transcription response.
  - Contains text and word-level timestamps.

- `docs/api/fixtures/transcribe-error.json`
  - Illustrative transcription failure response.
  - Contains the `error` field.

These fixtures are manually constructed examples,
not recordings of successful production requests.

## 8. Follow-up Work

The following GitHub issues track improvements
identified during the transcription API audit:

- #32 — Strengthen transcription API authentication.
- #33 — Minimize sensitive transcription logging.
- #34 — Validate transcription audio uploads.
- #35 — Document audio and transcript retention policies.

These issues are separate from the current API
documentation work and require further implementation
or investigation.

Related issues: #2, #4, #9.