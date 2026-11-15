export default defineNuxtConfig({
  compatibilityDate: '2026-11-15',
  // Swap these two modules and the Vercel output gets its headers back
  modules: ['@nuxtjs/sitemap', 'nuxt-security'],
  site: { url: 'https://example.com' },
  sitemap: {
    // Prerenders the sitemap through a second Nitro server, whose close empties headers.json
    zeroRuntime: true,
  },
  routeRules: {
    // Prerendered: should get the security headers through `ssg.nitroHeaders` and `ssg.exportToPresets`
    '/': { prerender: true },
    // Rendered on request, for comparison
    '/ssr': { prerender: false },
  },
});
