import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');

function load(file, mocks) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const context = {
    exports: {},
    require: (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
  };
  vm.runInNewContext(compiled, context, { filename: file });
  return context.exports;
}

const calls = [];
const { topicsApi } = load('src/services/topicsService.ts', {
  './apiService': {
    post: async (url, payload) => {
      calls.push({ url, payload });
      return { data: { message: 'Created', topic: { id: 1 } } };
    },
  },
});
for (const monitoring of [true, false]) {
  const payload = {
    name: 'Indikasi Ancaman',
    keyword: 'ancaman',
    workspace_id: 1,
    monitoring,
    media_sources: ['media', 'twitter'],
  };
  const response = await topicsApi.createThreatMonitoring(payload);
  assert.equal(calls.at(-1).url, '/v1/densus88/threat-monitoring/topics');
  assert.equal(calls.at(-1).payload, payload);
  assert.equal(response.data.topic.id, 1);
}
await topicsApi.create({ name: 'Legacy', keyword: 'test' });
assert.equal(calls.at(-1).url, '/topics', 'Legacy create API must remain available');

const accessCalls = [];
const { densus88AccessService } = load('src/services/densus88AccessService.ts', {
  './api': {
    get: async (url, options) => {
      accessCalls.push({ method: 'GET', url, options });
      return { data: { data: [], meta: { locked_polda: null } } };
    },
    put: async (url, payload) => {
      accessCalls.push({ method: 'PUT', url, payload });
      return { data: { message: 'Saved', data: { id: 7, polda: payload.polda } } };
    },
  },
});
const signal = new AbortController().signal;
await densus88AccessService.users('densus', 2, signal);
assert.equal(accessCalls.at(-1).url, '/v1/densus88/access-settings');
assert.equal(accessCalls.at(-1).options.params.search, 'densus');
assert.equal(accessCalls.at(-1).options.params.page, 2);
assert.equal(accessCalls.at(-1).options.signal, signal);
for (const polda of ['jabar', null]) {
  const result = await densus88AccessService.save(7, polda);
  assert.equal(accessCalls.at(-1).url, '/v1/densus88/access-settings/users/7');
  assert.equal(accessCalls.at(-1).payload.polda, polda);
  assert.equal(result.data.polda, polda);
}
await densus88AccessService.scope(signal);
assert.equal(accessCalls.at(-1).url, '/v1/densus88/polda/options');
assert.equal(accessCalls.at(-1).options.signal, signal);

const passthrough = ({ children }) => children;
const location = {
  pathname: '/propam/radar',
  search: '?topic_id=1',
  hash: '#sources',
  state: { source: 'bookmark' },
};
const { routesSection } = load('src/routes/sections.tsx', {
  'react-router-dom': { Outlet: passthrough, Navigate: 'Navigate', useLocation: () => location },
  'minimal-shared/utils': { varAlpha: () => '' },
  '@mui/material/Box': passthrough,
  '@mui/material/LinearProgress': { default: passthrough, linearProgressClasses: { bar: 'bar' }, __esModule: true },
  'src/routes/components': { ProtectedRoute: passthrough },
  'src/layouts/auth': { AuthLayout: passthrough },
  'src/layouts/dashboard': { DashboardLayout: passthrough },
});
const { navData } = load('src/layouts/nav-config-dashboard.tsx', {
  '@iconify/react': { Icon: passthrough },
  'lucide-react': { BookOpen: passthrough, ShieldCheck: passthrough },
  'src/components/label': { Label: passthrough },
});
const routes = routesSection[0].children;
const links = navData.flatMap((group) => group.items).map((item) => item.path);
assert.equal(links.filter((link) => link.startsWith('/propam/')).length, 0);
assert.equal(links.filter((link) => link.startsWith('/densus88/')).length, 10);
for (const link of links.filter((entry) => entry.startsWith('/densus88/'))) {
  const route = routes.find((entry) => `/${entry.path}` === link);
  assert.ok(route, `Missing page route: ${link}`);
  location.pathname = link.replace('/densus88/', '/propam/');
  const legacy = routes.find((entry) => `/${entry.path}` === location.pathname);
  assert.ok(legacy, `Missing legacy redirect: ${location.pathname}`);
  const redirect = legacy.element.type();
  assert.equal(redirect.props.to, `${link}${location.search}${location.hash}`);
  assert.equal(redirect.props.replace, true);
  assert.equal(redirect.props.state, location.state);
}
const access = routes.find((entry) => entry.path === 'densus88/access-settings');
assert.deepEqual(Array.from(access.element.props.allowedRoles), ['Operator']);
console.log('Densus88 checks OK: topic and access APIs, 10 navigation routes, legacy redirects, access guard.');
