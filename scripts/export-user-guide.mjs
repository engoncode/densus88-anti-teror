import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const build = path.join(root, 'docs/.guide-build');
let html = fs.readFileSync(path.join(build, 'panduan-offline.html'), 'utf8');
const files = fs.readdirSync(path.join(build, 'assets'));
const images = new Map(files.filter((file) => file.endsWith('.png')).map((file) => [
  file,
  `data:image/png;base64,${fs.readFileSync(path.join(build, 'assets', file)).toString('base64')}`,
]));

function embedImages(content) {
  content = content.replace(/new URL\("([^"]+\.png)",import\.meta\.url\)\.href/g, (_, file) => {
    const data = images.get(file);
    assert.ok(data, `Missing screenshot asset: ${file}`);
    return JSON.stringify(data);
  });
  for (const [file, data] of images) {
    content = content.replaceAll(`./assets/${file}`, data);
  }
  return content;
}

let scripts = 0;
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  assert.ok(src.startsWith('./assets/'), `Unexpected script URL: ${src}`);
  const script = embedImages(fs.readFileSync(path.join(build, src), 'utf8')).replaceAll('</script', '<\\/script');
  scripts++;
  return `<script type="module">${script}</script>`;
});
html = html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g, (_, href) => {
  assert.ok(href.startsWith('./assets/'), `Unexpected stylesheet URL: ${href}`);
  const css = embedImages(fs.readFileSync(path.join(build, href), 'utf8')).replaceAll('</style', '<\\/style');
  return `<style>${css}</style>`;
});

assert.equal(scripts, 1, 'Expected exactly one bundled guide script');
assert.ok(!/\b(?:src|href)="\.\/assets\//.test(html), 'Guide still references external build assets');
assert.ok(!html.includes('import("./'), 'Guide must not depend on dynamic imports');
assert.ok(!html.includes('import.meta.url'), 'Guide must not depend on the build directory');
assert.equal((html.match(/data:image\/png;base64,/g) ?? []).length, images.size, 'All screenshots must be embedded');
const output = path.join(root, 'docs/panduan-penggunaan.html');
fs.writeFileSync(output, html);
if (fs.existsSync(path.join(root, 'dist'))) {
  fs.copyFileSync(output, path.join(root, 'dist/panduan-offline.html'));
}
fs.rmSync(build, { recursive: true });
console.log(`HTML offline: ${output} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB)`);
