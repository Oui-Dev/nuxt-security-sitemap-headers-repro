# nuxt-security: prerendered pages lose their headers with `@nuxtjs/sitemap` `zeroRuntime`

A fresh Nuxt 4.6.4 app with `nuxt-security` 2.7.0 (default options) and `@nuxtjs/sitemap` 9.1.0 (`zeroRuntime: true`). It has one prerendered page (`/`) and one server-rendered page (`/ssr`).

```bash
npm install

# Node preset
npm run clean && npm run build && npm run check

# Vercel preset
npm run clean && npm run build:vercel && npm run check
```

`check.mjs` prints `.nuxt/nuxt-security/headers.json`, the routes of `.vercel/output/config.json` that carry a CSP header, and the headers the Node server sends for `/` and `/ssr`.

## Results

| Setup                                        | `headers.json`            | Node preset, `/`              | Vercel preset, `config.json` |
| -------------------------------------------- | ------------------------- | ----------------------------- | ---------------------------- |
| `@nuxtjs/sitemap` first, `zeroRuntime: true` | `{}`                      | no CSP, COOP, CORP, P-Policy  | no route with headers        |
| `nuxt-security` first, `zeroRuntime: true`   | `{}`                      | no CSP, COOP, CORP, P-Policy  | `/` gets its headers         |
| `zeroRuntime: false`                         | headers of `/`            | all headers                   | `/` gets its headers         |

`/ssr` gets all the headers in every case.

## Cause

In `zeroRuntime` mode, `@nuxtjs/sitemap` loads the prerender server a second time, in a worker thread, during `prerender:done`, to render the sitemap. When that instance closes, the `close` hook of nuxt-security's `90-prerenderedHeaders` plugin writes `headers.json` again. This instance rendered no page, so the file is replaced by `{}`.
