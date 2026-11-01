/* global __dirname */
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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, { exports, Map, require: name => dependencies[name], console, ...globals });
  return exports;
}

const jsx = (type, props) => ({ type, props: props || {} });
const native = { Platform: { select: values => values.ios }, View: 'View', Text: 'Text', Pressable: 'Pressable', ActivityIndicator: 'ActivityIndicator', StyleSheet: { create: value => value } };
function nodes(tree, type) { if (!tree || typeof tree !== 'object') return []; if (Array.isArray(tree)) return tree.flatMap(item => nodes(item, type)); return [...(tree.type === type ? [tree] : []), ...nodes(tree.props?.children, type)]; }

test('counts every deterministic filler occurrence without changing its analysis map', () => {
  const fillers = new Map([
    ['um', [{ start: 0, end: 0.3 }, { start: 1, end: 1.2 }]],
    ['you know', [{ start: 2, end: 2.4 }]],
  ]);

  const { countFillerOccurrences } = load('components/practice/feedback.ts');

  assert.equal(countFillerOccurrences(fillers), 3);
  assert.equal(fillers.get('um').length, 2);
});

test('uses direct deterministic wording when no fillers are detected', () => {
  const { fillerSummaryCopy } = load('components/practice/feedback.ts');

  assert.equal(fillerSummaryCopy(0), 'No filler words detected in this response.');
});

test('feedback and transcript components expose deterministic, readable result content', () => {
  const dependencies = { react: {}, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': native, './feedback': load('components/practice/feedback.ts'), './tokens': load('components/practice/tokens.ts', { 'react-native': native }) };
  const { FeedbackSummary } = load('components/practice/feedback-summary.tsx', dependencies);
  const { TranscriptPanel } = load('components/practice/transcript-panel.tsx', dependencies);
  const feedback = FeedbackSummary({ fillerResults: new Map([['um', [{}]]]) });
  const transcript = TranscriptPanel({ transcript: 'A readable response.' });
  assert.match(nodes(feedback, 'Text').map(n => n.props.children).join(' '), /1 filler word detected/i);
  assert.match(nodes(feedback, 'Text').map(n => n.props.children).join(' '), /um.*1/i);
  assert.equal(nodes(transcript, 'Text').some(n => n.props.selectable), true);
});

test('development preview route is guarded from production builds', () => {
  const source = fs.readFileSync(path.join(root, 'app/week1-preview.tsx'), 'utf8');
  assert.match(source, /__DEV__/);
  assert.match(source, /Redirect/);
  assert.match(source, /DEVELOPMENT PREVIEW/);
  assert.match(source, /useLocalSearchParams/);
  assert.match(source, /presentationMode/);
  assert.match(source, /!presentationMode/);
});

function recordingHarness() {
  const effects = [], states = [], dependenciesByEffect = [], cleanup = [], refs = [];
  let stateCursor, effectCursor, refCursor, preference, onMotionChange;
  let loops = 0, stops = 0;
  const dependencies = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useEffect: (effect, deps) => {
        const index = effectCursor++;
        if (!dependenciesByEffect[index] || deps.some((dep, i) => dep !== dependenciesByEffect[index][i])) {
          effects.push(() => { cleanup[index]?.(); cleanup[index] = effect(); });
          dependenciesByEffect[index] = deps;
        }
      },
      useRef: initial => { const index = refCursor++; return refs[index] ||= { current: initial }; },
      useState: initial => { const index = stateCursor++; if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial; return [states[index], value => { states[index] = value; }]; },
    },
    'react-native': { ...native, useWindowDimensions: () => ({ width: 402, height: 874, fontScale: 1 }),
      AccessibilityInfo: { isReduceMotionEnabled: () => new Promise(resolve => { preference = resolve; }), addEventListener: (_event, handler) => { onMotionChange = handler; return { remove() {} }; } },
      Animated: { View: 'AnimatedView', Value: class { stopAnimation() {} setValue() {} },
        loop: () => ({ start: () => loops++, stop: () => stops++ }), sequence: value => value, timing: () => ({}) },
    },
    './tokens': load('components/practice/tokens.ts', { 'react-native': native }),
  };
  const Control = load('components/practice/recording-control.tsx', dependencies).RecordingControl;
  return {
    Control: props => { stateCursor = effectCursor = refCursor = 0; return Control(props); },
    flushEffects: () => { effects.splice(0).forEach(effect => effect()); },
    resolvePreference: async value => { preference(value); await Promise.resolve(); },
    changePreference: value => onMotionChange(value),
    unmount: () => cleanup.forEach(dispose => dispose?.()),
    loopCount: () => loops, stopCount: () => stops,
  };
}

test('recording timer keeps a numeric idle state and formats minute boundaries', () => {
  const { Control } = recordingHarness();
  for (const [seconds, display] of [[0, '00:00'], [59, '00:59'], [60, '01:00'], [61, '01:01'], [3600, '60:00']]) {
    const tree = Control({ isRecording: seconds > 0, elapsedSeconds: seconds, onPress() {} });
    assert.ok(nodes(tree, 'Text').some(n => n.props.children === display), display);
  }
});

test('recording control exposes one labelled action and invokes the supplied callback', () => {
  const { Control } = recordingHarness();
  for (const recording of [false, true]) {
    let calls = 0;
    const tree = Control({ isRecording: recording, elapsedSeconds: 42, onPress: () => calls++ });
    const buttons = nodes(tree, 'Pressable');
    assert.equal(buttons.length, 1);
    assert.equal(buttons[0].props.accessibilityLabel, recording ? 'Stop recording' : 'Start recording');
    buttons[0].props.onPress();
    assert.equal(calls, 1);
  }
});

test('recording pulse stays still until the motion preference is known', () => {
  const harness = recordingHarness();
  harness.Control({ isRecording: true, elapsedSeconds: 42, onPress() {} });
  harness.flushEffects();
  assert.equal(harness.loopCount(), 0);
});

test('reduced-motion preference prevents pulses and a preference change stops an active pulse', async () => {
  const harness = recordingHarness();
  const props = { isRecording: true, elapsedSeconds: 42, onPress() {} };
  harness.Control(props);
  harness.flushEffects();
  await harness.resolvePreference(true);
  harness.Control(props);
  harness.flushEffects();
  assert.equal(harness.loopCount(), 0);
  harness.changePreference(false);
  harness.Control(props);
  harness.flushEffects();
  assert.equal(harness.loopCount(), 1);
  harness.changePreference(true);
  harness.Control(props);
  harness.flushEffects();
  assert.equal(harness.stopCount(), 1);
  harness.unmount();
});

function previewHarness(dev, params) {
  const values = [];
  let cursor = 0;
  const dependencies = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: { useState: initial => { const index = cursor++; if (!(index in values)) values[index] = typeof initial === 'function' ? initial() : initial; return [values[index], value => { values[index] = value; }]; }, useEffect: () => {} },
    'react-native': native,
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'expo-router': { Redirect: 'Redirect', Stack: { Screen: 'StackScreen' }, useLocalSearchParams: () => params },
    '@/components/practice/tokens': load('components/practice/tokens.ts', { 'react-native': native }),
  };
  for (const [file, name] of [['feedback-summary', 'FeedbackSummary'], ['practice-session', 'PracticeSession'], ['practice-prompt-card', 'PracticePromptCard'], ['recording-control', 'RecordingControl'], ['recording-review-bar', 'RecordingReviewBar'], ['results-header', 'ResultsHeader'], ['submission-state', 'SubmissionState'], ['transcript-panel', 'TranscriptPanel']]) {
    dependencies['@/components/practice/' + file] = { [name]: name };
  }
  const Preview = load('app/week1-preview.tsx', dependencies, { __DEV__: dev }).default;
  return () => { cursor = 0; return Preview(); };
}

test('clean development capture hides fixture chrome while retaining stop transition', () => {
  const render = previewHarness(true, { state: 'recording', capture: '1' });
  const initial = render();
  assert.equal(nodes(initial, 'Text').some(n => String(n.props.children).includes('DEVELOPMENT PREVIEW')), false);
  const control = nodes(initial, 'RecordingControl')[0];
  assert.equal(control.props.isRecording, true);
  control.props.onPress();
  assert.equal(nodes(render(), 'RecordingReviewBar').length, 1);
});

test('production preview redirects even with a valid capture query', () => {
  const tree = previewHarness(false, { state: 'recording', capture: '1' })();
  assert.equal(tree.type, 'Redirect');
  assert.equal(tree.props.href, '/login');
});

test('editorial review keeps factual feedback secondary to a bounded readable transcript', () => {
  const recordScreen = fs.readFileSync(path.join(root, 'components/recording/record-button.tsx'), 'utf8');
  const prompt = fs.readFileSync(path.join(root, 'components/practice/practice-prompt-card.tsx'), 'utf8');
  const feedback = fs.readFileSync(path.join(root, 'components/practice/feedback-summary.tsx'), 'utf8');
  const transcript = fs.readFileSync(path.join(root, 'components/practice/transcript-panel.tsx'), 'utf8');
  assert.match(recordScreen, /ResultsHeader/);
  assert.match(prompt, /editorialRule/);
  assert.match(feedback, /summaryRule/);
  assert.match(transcript, /ScrollView/);
  assert.match(transcript, /maxHeight/);
  assert.match(transcript, /selectable/);
});
