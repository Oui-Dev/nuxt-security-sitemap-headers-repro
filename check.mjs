// Prints what nuxt-security exported for the prerendered pages, and the headers served by the
// Node build for a prerendered page and a server-rendered one
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const file = ['.nuxt/nuxt-security/headers.json', 'node_modules/.cache/nuxt/.nuxt/nuxt-security/headers.json'].find(existsSync);
console.log(`${file ?? 'headers.json not found'}: ${file ? readFileSync(file, 'utf8').slice(0, 120) : ''}`);

if (existsSync('.vercel/output/config.json')) {
  const { routes } = JSON.parse(readFileSync('.vercel/output/config.json', 'utf8'));
  const withCsp = routes.filter((route) => route.headers?.['content-security-policy']).map((route) => route.src);
  console.log(`.vercel/output/config.json: ${withCsp.length} route(s) with a CSP header ${withCsp.join(' ')}`);
}

if (existsSync('.output/server/index.mjs')) {
  const server = spawn(process.execPath, ['.output/server/index.mjs'], { env: { ...process.env, PORT: '3962', HOST: '127.0.0.1' }, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try {
      await fetch('http://127.0.0.1:3962/ssr');
      break;
    } catch {
      await wait(150);
    }
  }
  const names = ['content-security-policy', 'cross-origin-opener-policy', 'cross-origin-resource-policy', 'permissions-policy'];
  for (const path of ['/', '/ssr']) {
    const response = await fetch(`http://127.0.0.1:3962${path}`, { headers: { accept: 'text/html' } });
    console.log(`GET ${path.padEnd(4)} ${response.status} ${names.map((name) => `${response.headers.has(name) ? '✓' : '✗'} ${name}`).join('  ')}`);
  }
  server.kill();
}
