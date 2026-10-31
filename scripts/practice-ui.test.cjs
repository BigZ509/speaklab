/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = process.env.SPEAKLAB_ROOT || path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));

function load(file) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, { exports, Map });
  return exports;
}

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
