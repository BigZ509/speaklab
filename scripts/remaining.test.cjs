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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require(name) {
    if (name in dependencies) return dependencies[name];
    throw new Error(`Unexpected dependency: ${name}`);
  }, console, Error, process: { env: {} } });
  return exports;
}
function analyze(tokens) {
  return load('speechEngine/fillers.ts', { react: {} }).fillerAnalyzer({
    text: tokens.join(' '), words: tokens.map((word, index) => ({ word, start: index, end: index + 0.5 })),
  });
}
test('normalizes casing and punctuation without changing timestamps', () => {
  const result = analyze(['Um,', '“UH!”', 'umm...']);
  assert.equal(result.get('um')?.[0].start, 0);
  assert.equal(result.get('uh')?.[0].end, 1.5);
  assert.equal(result.get('umm')?.length, 1);
});
test('matches multiword fillers next to an obvious filler', () => {
  const result = analyze(['UM,', 'You', 'know,', 'hello']);
  assert.equal(result.get('you know')?.length, 1);
  assert.equal(result.get('you know')[0].start, 1);
  assert.equal(result.get('you know')[0].end, 2.5);
});
test('prefers the full phrase and counts it once with fillers on both sides', () => {
  const result = analyze(['um', 'well', 'then', 'uh']);
  assert.equal(result.get('well then')?.length, 1);
  assert.equal(result.has('well'), false);
  assert.equal(result.has('then'), false);
});
test('preserves context rule and accumulates repeated fillers', () => {
  assert.equal(analyze(['I', 'like', 'music']).size, 0);
  assert.equal(analyze(['you', 'know', 'the', 'answer']).size, 0);
  assert.equal(analyze(['um', 'hello', 'um']).get('um').length, 2);
});
const jsx = (type, props) => ({ type, props: props || {} });
function stateHarness() {
  const slots = []; let cursor = 0; const pending = []; const cleanups = [];
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((d,j) => !Object.is(d,slots[i][j]))) { slots[i] = deps; pending.push(() => { cleanups[i]?.(); cleanups[i] = fn(); }); } },
    createContext: () => ({ Provider: 'Provider' }),
  };
  return { react, render(component) { cursor = 0; const result = component(); while (pending.length) pending.shift()(); return result; } };
}
function nodes(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(t => nodes(t,type));
  return [...(tree.type === type ? [tree] : []), ...nodes(tree.props?.children,type)];
}
const native = { View: 'View', Text: 'Text', Pressable: 'Pressable', TextInput: 'TextInput', ActivityIndicator: 'ActivityIndicator', StyleSheet: { create: x => x }, Alert: { alert() {} } };
class FirebaseError extends Error { constructor(code) { super(code); this.code = code; } }
function signup(existing = null) {
  const h = stateHarness(); const auth = { currentUser: existing }; let creates = 0, writes = 0, fail = true; const alerts = [];
  const form = load('components/login/signup-form.tsx', {
    react: h.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': { ...native, Alert: { alert: (...args) => alerts.push(args.join(' ')) } },
    '@/firebase/config': { auth, db: {} }, 'firebase/app': { FirebaseError },
    'firebase/auth': { onAuthStateChanged: (_, cb) => { cb(auth.currentUser); return () => {}; }, signOut: async () => {}, createUserWithEmailAndPassword: async () => { creates++; auth.currentUser = { uid: 'u1', email: 'a@b.com' }; return { user: auth.currentUser }; } },
    'firebase/firestore': { doc: (_, collection, uid) => ({ collection, uid }), setDoc: async (ref, data) => { writes++; assert.equal(ref.uid, 'u1'); assert.equal(data.username, 'Ada'); if (fail) throw new FirebaseError('unavailable'); } },
  }).SignUpForm;
  return { render: () => h.render(form), auth, alerts, get creates() { return creates; }, get writes() { return writes; }, succeed() { fail = false; } };
}
function fill(s) { for (const input of nodes(s.render(),'TextInput')) { const value = input.props.placeholder === 'Username' ? 'Ada' : input.props.placeholder === 'Email' ? 'a@b.com' : 'password123'; input.props.onChangeText(value); } }
test('profile retry reuses the created account', async () => {
  const s = signup(); fill(s); await nodes(s.render(),'Pressable')[0].props.onPress();
  assert.equal(s.creates, 1); assert.match(s.alerts.at(-1), /profile/i);
  s.succeed(); await nodes(s.render(),'Pressable')[0].props.onPress();
  assert.equal(s.creates, 1); assert.equal(s.writes, 2);
});
test('restored account completes its profile without recreating auth', async () => {
  const s = signup({ uid: 'u1', email: 'a@b.com' }); fill(s); s.succeed();
  await nodes(s.render(),'Pressable')[0].props.onPress(); assert.equal(s.creates, 0); assert.equal(s.writes, 1);
});
test('double submit cannot create two accounts', async () => {
  const s = signup(); fill(s); const submit = nodes(s.render(),'Pressable')[0].props.onPress;
  await Promise.all([submit(), submit()]); assert.equal(s.creates, 1);
});
test('web config starts without any native persistence export', () => {
  const app = {}; const auth = {}; const db = {};
  const result = load('firebase/config.ts', { './app': { app }, 'firebase/app': { initializeApp: () => app },
    'firebase/auth': { getAuth: () => auth }, 'firebase/firestore': { getFirestore: () => db },
    '@react-native-async-storage/async-storage': {} });
  assert.equal(result.auth, auth); assert.equal(result.db, db);
});
function layoutHarness() {
  const h = stateHarness(); let authChanged, profileChanged, profileFailed; let subscribed = 0;
  const Stack = () => {}; Stack.Protected = 'Protected'; Stack.Screen = 'Screen';
  const layout = load('app/_layout.tsx', {
    react: h.react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-native': native,
    '@react-navigation/native': { DarkTheme: {}, DefaultTheme: {}, ThemeProvider: 'ThemeProvider' },
    'expo-router': { Stack }, 'expo-status-bar': { StatusBar: 'StatusBar' }, 'react-native-reanimated': {},
    '@/firebase/config': { auth: {}, db: {} }, '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    'firebase/auth': { onAuthStateChanged: (_, cb) => { authChanged = cb; return () => {}; }, signOut: async () => {} },
    'firebase/firestore': { doc: () => ({}), onSnapshot: (_, options, success, failure) => { subscribed++; profileChanged = success; profileFailed = failure; return () => {}; } },
  }).default;
  return { render: () => h.render(layout), login() { authChanged({ uid: 'u1' }); },
    profile(data, pending = false) { profileChanged({ data: () => data, exists: () => !!data, metadata: { hasPendingWrites: pending, fromCache: false } }); },
    fail() { profileFailed(new Error('offline')); }, get subscribed() { return subscribed; } };
}
function allows(tree, route) { return nodes(tree, 'Protected').some(n => n.props.guard && nodes(n,'Screen').some(s => s.props.name === route)); }
test('signed-in users cannot reach tabs until profile exists', () => {
  const h = layoutHarness(); h.render(); h.login(); let tree = h.render();
  assert.equal(allows(tree, '(tabs)'), false);
  h.profile(undefined); tree = h.render(); assert.equal(allows(tree,'signup'), true); assert.equal(allows(tree,'(tabs)'), false);
  h.profile({ uid: 'u1', username: 'Ada' }); tree = h.render(); assert.equal(allows(tree,'(tabs)'), true);
});
test('profile read failure offers a retry', () => {
  const h = layoutHarness(); h.render(); h.login(); h.render(); h.fail();
  const tree = h.render(); assert.equal(allows(tree,'(tabs)'), false);
  const retry = nodes(tree,'Pressable').find(n => nodes(n,'Text').some(t => t.props.children === 'Retry'));
  assert.ok(retry); retry.props.onPress(); h.render(); assert.equal(h.subscribed, 2);
});

test('pending profile writes do not unlock the app before server acknowledgement', () => {
  const h = layoutHarness(); h.render(); h.login(); h.render(); h.profile(undefined); h.render();
  h.profile({ uid: 'u1', username: 'Ada' }, true);
  assert.equal(allows(h.render(), '(tabs)'), false);
  h.profile({ uid: 'u1', username: 'Ada' });
  assert.equal(allows(h.render(), '(tabs)'), true);
});
test('native auth persists through AsyncStorage and reuses initialized sessions', () => {
  const app = {}, auth = {}, storage = {}, persistence = {}; let initialized = false;
  const dependencies = { './app': { app }, '@react-native-async-storage/async-storage': storage,
    'firebase/firestore': { getFirestore: () => ({}) },
    'firebase/auth': {
      getReactNativePersistence(value) { assert.equal(value, storage); return persistence; },
      initializeAuth(value, options) {
        assert.equal(value, app); assert.equal(options.persistence, persistence);
        if (initialized) throw new FirebaseError('auth/already-initialized');
        initialized = true; return auth;
      },
      getAuth: () => auth,
    },
  };
  assert.equal(load('firebase/config.native.ts', dependencies).auth, auth);
  assert.equal(load('firebase/config.native.ts', dependencies).auth, auth);
  dependencies['firebase/auth'].initializeAuth = () => { throw new FirebaseError('auth/invalid-api-key'); };
  assert.throws(() => load('firebase/config.native.ts', dependencies), /invalid-api-key/);
});
test('web config initializes using the installed Firebase SDK', async () => {
  const sdkApp = require(path.join(root, 'node_modules/firebase/app'));
  const sdkAuth = require(path.join(root, 'node_modules/firebase/auth'));
  const sdkFirestore = require(path.join(root, 'node_modules/firebase/firestore'));
  const app = sdkApp.initializeApp({ apiKey: 'test-api-key', projectId: 'demo-speaklab-test' }, 'speaklab-regression');
  try {
    const result = load('firebase/config.ts', { './app': { app }, 'firebase/auth': sdkAuth, 'firebase/firestore': sdkFirestore });
    assert.equal(result.auth.app, app);
    assert.equal(result.db.app, app);
  } finally { await sdkApp.deleteApp(app); }
});
