import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const compiled = ts.transpileModule(read('src/sections/user-guide/guide-data.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { guidePages, guideGroups } = context.exports;
const excludedRoutes = new Set(['/settings']);
const ids = new Set();
const documented = new Set();
for (const entry of guidePages) {
  assert.ok(!ids.has(entry.id), `Duplicate guide anchor: ${entry.id}`);
  ids.add(entry.id);
  assert.ok(guideGroups.includes(entry.group), `Unknown group: ${entry.group}`);
  assert.ok(entry.purpose && entry.steps.length && entry.cautions.length, `Incomplete page guide: ${entry.id}`);
  for (const route of [entry.path, ...(entry.aliases ?? [])]) {
    assert.ok(!documented.has(route), `Duplicate route guide: ${route}`);
    documented.add(route);
  }
  assert.ok(entry.screenshot, `Missing screenshot mapping: ${entry.id}`);
  assert.ok(fs.existsSync(path.join(root, `docs/screenshots/${entry.screenshot}.png`)), `Missing screenshot: ${entry.screenshot}`);
}
for (const route of excludedRoutes) {
  assert.ok(!documented.has(route), `Unused route must not appear in the guide: ${route}`);
}
const routes = ts.createSourceFile('sections.tsx', read('src/routes/sections.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(routes) === 'path' && ts.isStringLiteral(node.initializer)) {
    const route = node.initializer.text;
    if (route !== '*' && !excludedRoutes.has(`/${route}`)) assert.ok(documented.has(`/${route}`), `Undocumented route: /${route}`);
  }
  ts.forEachChild(node, visit);
}
visit(routes);
assert.ok(documented.has('/'), 'Dashboard index must be documented');
const navigation = ts.createSourceFile('navigation.tsx', read('src/layouts/nav-config-dashboard.tsx'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function checkNavigation(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(navigation) === 'path' && ts.isStringLiteral(node.initializer)) {
    assert.ok(documented.has(node.initializer.text), `Undocumented navigation link: ${node.initializer.text}`);
  }
  ts.forEachChild(node, checkNavigation);
}
checkNavigation(navigation);
console.log(`Guide coverage OK: ${guidePages.length} pages, ${documented.size} route patterns, screenshots and navigation checked.`);
