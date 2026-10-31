/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = process.env.SPEAKLAB_ROOT || path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function load(file, dependencies = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, { exports, Map, require: name => dependencies[name], console });
  return exports;
}

const jsx = (type, props) => ({ type, props: props || {} });
const native = { View: 'View', Text: 'Text', Pressable: 'Pressable', ActivityIndicator: 'ActivityIndicator', StyleSheet: { create: value => value } };
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

test('recording control makes elapsed time and the recording instrument explicit', () => {
  const source = fs.readFileSync(path.join(root, 'components/practice/recording-control.tsx'), 'utf8');
  const tokenSource = fs.readFileSync(path.join(root, 'components/practice/tokens.ts'), 'utf8');
  assert.match(source, /elapsedSeconds/);
  assert.match(source, /Recording time/);
  assert.match(source, /fontVariant:\s*\['tabular-nums'\]/);
  assert.match(tokenSource, /timerSize:\s*56/);
  assert.match(tokenSource, /controlSize:\s*128/);
  assert.match(source, /ring/);
  assert.match(source, /outerActive/);
  assert.match(source, /middleActive/);
  assert.match(source, /innerActive/);
  assert.match(source, /AccessibilityInfo/);
  assert.match(source, /reduceMotion/);
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
