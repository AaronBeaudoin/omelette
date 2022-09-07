# `vite-plugin-ssr-vue-starter`

An opinionated starter template for Vite + Vue similar to [`antfu/vitesse`](https://github.com/antfu/vitesse), but focused on **server-side rendering** (SSR) via [`vite-plugin-ssr`](https://vite-plugin-ssr.com) and an opinionated deployment architecture strategy using [Vercel](https://vercel.com/home).

## Pending Ecosystem Issues

Issues are listed in order of most problematic to least problematic. All issues are related specifically to SSR unless otherwise specified.

1. [`vite/#9341`](https://github.com/vitejs/vite/issues/9341) — **HMR doesn't work for `.page.client.vue` files.**  
   _This issue also cases Tailwind CSS to break for `.page.client.vue` files. Lack of HMR generally results in a much slower development speed for CSS styling, and `.page.client.xyz` files are important for highly interactive pages that depend a lot on the client-side, such as cart or checkout pages._
2. [`vite-plugin-ssr/#411`](https://github.com/brillout/vite-plugin-ssr/issues/411) — **UnoCSS doesn't work for `.page.server.xyz`.**  
   _`.page.server.xyz` files are considered low-priority right now, but they're important for marketing pages that need to be super lightweight and fast. I personally feel that this issue should be higher priority._
3. [`vite-plugin-md/#112`](https://github.com/antfu/vite-plugin-md/issues/112) — **Component auto-importing doesn't work for `.md` files.**  
   _You can always just manually import the component, or not use components in your `.md` files, so this issue is really just a minor annoyance. And since it affects all SSR frameworks, it should be fixed soon._

## Pending Features

### Functions Features

- **`_dispatch` Edge Function**  
  _Rather than accessing all functions directly, the app will interact with functions via a `_dispatch` function which is rewritten to for all paths at `/fn/**`. This function runs at the edge so it has no cold-start, and itself handles calls to all serverless functions acting sort of like a middleware. This architecture lets us easily use the `_dispatch` function to handle redirecting to prebuilt queries, revalidating on-demand, and skipping builders with a preview mode._  
  _**EDIT: Rework this to be an edge middleware instead if possible. So far, performance when going through an edge function seems to be significantly worse than accessing a route directly, and I suspect using a middleware instead might solve the issue.**_
- **`_prebuilt` Functions**  
  _Builder functions can have arbitrary specific query combinations prebuilt at build-time to ensure "full-static-like" performance on every request. My current plan is to implement this by generating "symlink" functions in a `output/functions/_prebuilt/` directory along with a manifest of all prebuilt query combinations. I then import this manifest in my `_dispatch` function and "redirect" queries when applicable._
- **Development/Preview Middleware**  
  _Functions can be used in development/preview environment just the same as production, but with prebuilding disabled. Made possible by a simple connect middleware that can be plugged into both the Vite development server (via a plugin) and the `preview.ts` server (with custom logging enabled via a `response.locals.[flag]`)._
- **`refresh=` Parameter for On-Demand Revalidation**  
  _Builder (prerender) functions can be revalidated on-demand. This will be implemented via the `_dispatch` function and allow builder function queries to be refreshed at any time._
- **`preview=` Parameter for Skipping Builders**  
  _Preview mode can be used to ensure function data is always direct and skip builders. This will be implemented via the `_dispatch` function and cause request to be "redirected" to some special `_direct` function that has all of the other functions bundled into it. The "underlying" functions are selected via some `_=` or `path=` parameter on the `_direct` function, or maybe a header to ensure zero conflicts._

### Included Libraries

Automatically include some common useful dependencies.

`lodash`, `date-fns`, `xregexp`, `@vueuse/core`, `vue-imask`

## More Random Thoughts

- The preview script should only have one mode now. Since deployment is opinionated and based only on Cloudflare Workers, we can deploy in such a way that assumes we never need full static. This DOESN'T mean we NEVER need any static pages, however. We can still make pages static, but doing so simply causes the file at the URL to take precedence over server rendering because the worker always checks for a static file first.
