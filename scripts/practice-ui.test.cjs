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
});

test('recording control exposes a readable elapsed duration while recording', () => {
  const source = fs.readFileSync(path.join(root, 'components/practice/recording-control.tsx'), 'utf8');
  assert.match(source, /elapsedSeconds/);
  assert.match(source, /Recording time/);
});
