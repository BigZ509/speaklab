/* global __dirname */
// Run with: node --test scripts/submission.test.cjs
// Native audio and networking are isolated; the actual service and hook execute below.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.SPEAKLAB_ROOT || path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, {
    exports, require: name => {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    }, console: { log() {}, error() {} }, Error, ...globals,
  });
  return exports;
}
const transcript = { text: 'um hello', words: [
  { word: 'um', start: 0, end: 0.3 }, { word: 'hello', start: 0.4, end: 1 },
] };
function service(response) {
  return load('services/transcription-services.ts', {}, {
    FormData: class { append() {} }, fetch: async () => response,
  }).transcribeAudio;
}
test('returns a valid transcript', async () => {
  assert.equal(await service({ ok: true, json: async () => transcript })('recording'), transcript);
});
test('rejects HTTP failure before interpreting its body as a transcript', async () => {
  await assert.rejects(service({ ok: false, status: 503, json: async () => ({ error: 'Unavailable' }) })('recording'), /503/);
});
for (const [name, data] of [
  ['missing words', { text: 'hello' }],
  ['null response', null],
  ['non-string text', { text: 42, words: [] }],
  ['invalid word timestamps', { text: 'hello', words: [{ word: 'hello', start: '0', end: 1 }] }],
  ['reversed timestamps', { text: 'hello', words: [{ word: 'hello', start: 2, end: 1 }] }],
]) test(`rejects ${name}`, async () => {
  await assert.rejects(service({ ok: true, json: async () => data })('recording'), /invalid.*transcript/i);
});
function hookHarness(transcribeAudio) {
  // Small synchronous hook harness: state persists between explicit renders.
  // Device recording/React lifecycle integration still requires a device test.
  const slots = []; let cursor = 0;
  const react = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = value; }]; },
    useRef(initial) { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
    useEffect() {},
  };
  const recorder = { uri: 'recording.m4a', prepareToRecordAsync: async () => {}, record() {}, stop: async () => {} };
  const analyzer = load('speechEngine/fillers.ts', { react });
  const useHook = load('hooks/use-audio-recording.ts', {
    react, 'react-native': { Alert: { alert() {} } },
    'expo-av': {}, 'expo-audio': {
      RecordingPresets: { HIGH_QUALITY: {} }, useAudioRecorder: () => recorder,
      useAudioRecorderState: () => ({}), useAudioPlayer: () => ({ play() {} }),
      useAudioPlayerStatus: () => ({ isLoaded: true }),
    },
    '@/services/transcription-services': { transcribeAudio },
    '@/utils/handle-error': { errorHandling() {} }, '@/speechEngine/fillers': analyzer,
  }).default;
  // This harness intentionally invokes the hook with controlled React state.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return { render() { cursor = 0; return useHook(); } };
}
async function recorded(transcribe) {
  const harness = hookHarness(transcribe);
  await harness.render().stopRecording();
  return harness;
}
test('successful submission exposes transcript and filler results', async () => {
  const h = await recorded(async () => transcript);
  await h.render().submitRecording(); const state = h.render();
  assert.equal(state.transcriptText, transcript);
  assert.equal(state.isSubmitted, true);
  assert.equal(state.fillerResults.get('um').length, 1);
});
test('failed submission is not successful and allows retry', async () => {
  let fail = true;
  const h = await recorded(async () => { if (fail) throw new Error('Network unavailable'); return transcript; });
  await h.render().submitRecording();
  assert.equal(h.render().isSubmitted, false);
  assert.equal(h.render().submissionStatus, 'error');
  assert.match(h.render().submissionError, /Network unavailable/);
  fail = false; await h.render().submitRecording();
  assert.equal(h.render().isSubmitted, true);
  assert.equal(h.render().submissionError, null);
});
test('duplicate taps share one pending submission and block recording replacement', async () => {
  let resolve; let calls = 0;
  const pending = new Promise(r => { resolve = r; });
  const h = await recorded(() => { calls++; return pending; });
  const state = h.render(); const first = state.submitRecording(); const second = state.submitRecording();
  assert.equal(calls, 1);
  assert.equal(h.render().submissionStatus, 'submitting');
  await h.render().startRecording();
  assert.equal(h.render().recordingAudio, 'recording.m4a');
  resolve(transcript); await Promise.all([first, second]);
  assert.equal(h.render().isSubmitted, true);
});
test('starting a new recording clears previous results', async () => {
  const h = await recorded(async () => transcript);
  await h.render().submitRecording(); await h.render().startRecording();
  assert.equal(h.render().transcriptText, null);
  assert.equal(h.render().isSubmitted, false);
  assert.equal(h.render().fillerResults, null);
});
test('no recording does not submit', async () => {
  let calls = 0; const h = hookHarness(async () => { calls++; return transcript; });
  await h.render().submitRecording(); assert.equal(calls, 0);
  assert.equal(h.render().isSubmitted, false);
});
