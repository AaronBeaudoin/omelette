# `vite-plugin-ssr-vue-starter`

An opinionated starter template for Vite + Vue similar to [`antfu/vitesse`](https://github.com/antfu/vitesse), but focused on **server-side rendering** (SSR) via [`vite-plugin-ssr`](https://vite-plugin-ssr.com) and an opinionated deployment architecture strategy using [Vercel](https://vercel.com/home).


# IDEA

Instead of using this README for documentation, make the pages of this starter the documentation itself!


## Docs Here

When choosing a stack for a website you have to make a lot of decisions. The research you'll do in order to make these decisions will likely take you days and require a lot of experimentation and testing. The aim of this repository is to help make your life easier by opinionatedly making most of these decisions for you. This document will describe what decisions were made for you and which ones you'll still need to make yourself.

- Talk about the chosen stack and the reason for each decision.


## Pending Issues

1. Logs are super ugly. Since the project has to run both Vite and Wrangler at the same time, and both really like to take over the whole terminal, I haven't found a clean way to mix everything. If nice terminal logs are important to you, the best solution right now is to run `npm run dev:manifest`, `npm run dev:manifest`, and `npm run dev:manifest` separately rather than just running `npm run dev`.


## Pending Ecosystem Issues

Issues are listed in order of most problematic to least problematic. All issues are related specifically to SSR unless otherwise specified.

1. [`vite/#9341`](https://github.com/vitejs/vite/issues/9341) — **HMR doesn't work for `.page.client.vue` files.**  
   _This issue also cases Tailwind CSS to break for `.page.client.vue` files. Lack of HMR generally results in a much slower development speed for CSS styling, and `.page.client.xyz` files are important for highly interactive pages that depend a lot on the client-side, such as cart or checkout pages._
2. [`vite-plugin-ssr/#411`](https://github.com/brillout/vite-plugin-ssr/issues/411) — **UnoCSS doesn't work for `.page.server.xyz`.**  
   _`.page.server.xyz` files are considered low-priority right now, but they're important for marketing pages that need to be super lightweight and fast. I personally feel that this issue should be higher priority._
3. [`vite-plugin-md/#112`](https://github.com/antfu/vite-plugin-md/issues/112) — **Component auto-importing doesn't work for `.md` files.**  
   _You can always just manually import the component, or not use components in your `.md` files, so this issue is really just a minor annoyance. And since it affects all SSR frameworks, it should be fixed soon._


### Included Libraries

Automatically include some common useful dependencies.

`lodash`, `date-fns`, `xregexp`, `@vueuse/core`, `vue-imask`


## More Random Thoughts

- Need to make `_default.page.server.ts` use streams instead of rendering to a string.
- Test Workers on custom subdomain
- Test function with JSON return (text vs stream)
- Add Git CI/CD with Actions
  - Ensure node_modules are cached
  - Lookup best practices for performance
  - Looks like best option might be simply cloudflares officail github action https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler
- Add caching to functions
  - Add preview mode via some secret passed via a `?preview=<secret>` query parameter.
  - Preview mode is always enabled in dev/preview.
  - Add a `?refresh=<secret>` query parameter than can be added to any route + query to refresh.
