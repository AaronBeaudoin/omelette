# Omelette

**Omelette** is an opinionated _recipe_ that demonstrates how to build a fast dynamic website/application. It was created as a base for real-world applications and jump-starts you with:

- A **flexible project/deployment architecture** used for production websites.
- Hand-picked **robust tools and libraries** for painless development (Vite, Vue).
- A cost-effective, performant, and **scalable deployment platform** (Cloudflare Workers).


## Core Ingredients

- [**`vite-plugin-ssr`**](https://vite-plugin-ssr.com) — Lightweight SSR Plugin
- [**Vite**](https://vitejs.dev) — Development and Bundle/Build Tooling
- [**Vue**](https://vuejs.org) — Easy Yet Powerful Front-End UI Framework
- [**UnoCSS**](https://uno.antfu.me) — Tailwind-Compatible Atomic CSS Engine
- [**Cloudflare Workers**](https://workers.cloudflare.com) — Cutting-Edge Deployment Platform


## Getting Started

1. Clone this repository.

```
git clone https://github.com/AaronBeaudoin/omelette
```

2. Install dependencies.

```
npm install
```

3. Run the development server.

```
npm run dev
```


<!--

## The Story

I'm someone who likes to be on the cutting edge, so when I started learning web development I went _all in_ on the [Jamstack](https://jamstack.org). I had battled with WordPress, so I was ready for the "future" of web development. I deployment a website for my job using a full-static architecture with [Nuxt.js](https://nuxtjs.org) on [Firebase](https://firebase.google.com). It was overall quite a success, but I also learned a lot about the drawbacks of the typical Jamstack architecture as well.

One of the core idea of the Jamstack architecture is that by pre-rendering all your pages during the build process you can make your site crazy fast by only serving _static content_ to the client/browser. This content is cached and deployed on edge locations around the world so the client/browser is always communicating with a server as close as possible to their geographical location. Many applications are then designed to handle further navigation on the client-side for even greater percieved performance.

For some really simple sites this can be _perfect_, but it also comes with a whole slew of new issues:

- All updates to site content either require a full re-build, or depend on client-side logic, hurting SEO.
- Many "back-end" services aren't designed to be accessed entirely from the client/browser.
- Client-side navigation doesn't play well with many analytics solutions and adds complexity.
- At some point you'll likely end up creating middleware or serverless function anyways.

These are just a few of the real issues which I ran into myself when building a Jamstack ecommerce site. It is _possible_ to get around each of them, but eventually I felt that I had just gone from fighting WordPress to fighting the Jamestack architecture instead. Some platforms address some of these issues with creative approaches such as [Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration).

Of course, there is no perfect architecture to rule them all, but it turns out that the modern web is just entering a new phase of deployment tech which solves many of the problems—computing at the _edge_.

Edge computing is still quite new, so your options are limited, and there are drawbacks which are very important to consider. However, overall I would consider it a major step forward.

<hr>

When building a web application/site, one of the most time consuming parts is coming up with a fast, modern architecture and choosing your "stack"—that is, all the technologies you want to bring together in your project in order to make it work.

That way, you can jump right to the part where you actually create and deploy your project. The platforms of choice allow you to get up and running at an initial cost of zero.

- Built around a **flexible architecture** that works well for a wide range of use cases.
- Deployment and CI/CD platforms of choice both let you **get started at no cost**.
- Some of the most useful libraries are **already included** and ready to use.

 for Vite + Vue similar to [`antfu/vitesse`](https://github.com/antfu/vitesse), but focused on **server-side rendering** (SSR) via [`vite-plugin-ssr`](https://vite-plugin-ssr.com) and an opinionated deployment architecture strategy using [Vercel](https://vercel.com/home).


## Main Ingredients

- [**`vite-plugin-ssr`**](https://vite-plugin-ssr.com)  
  The glue that holds the whole project together.
- [**Vite**](https://vitejs.dev)  
  Development server and build process.
- [**Vue.js**](https://vuejs.org)  
  My favorite JavaScript framework.
- [**Cloudflare Workers**](https://workers.cloudflare.com)  
  Deployment shouldn't 
- [**GitHub Actions**](https://github.com/features/actions)  
  Deployment shouldn't 

## Tell Me More

There are _thousands_ of services/platforms out there that claim to help you "skip the decision-making process" and get right to the development process of your project. How is Omelette any different?

Each of those platforms out there are trying to get you to use their product, so you're not really looking at advice that is objectively trying to help you pick the best tools on the market. Omelette was created by Aaron Beaudoin (me), a solo developer who was fed up with all the marketing and wanted to just find a solid, scalable, and easy way to go from 0% to 100% building a web application/site for his job. Of course, I want you to use Omelette, otherwise I wouldn't have bothered sharing it—but that's just because I actually want to make your life easier in exchange for some sweet GitHub stars to slap on my resume—if you don't mind. 😁


## Docs Here

When choosing a stack for a website you have to make a lot of decisions. The research you'll do in order to make these decisions will likely take you days and require a lot of experimentation and testing. The aim of this repository is to help make your life easier by opinionatedly making most of these decisions for you. This document will describe what decisions were made for you and which ones you'll still need to make yourself.

- Talk about the chosen stack and the reason for each decision.


## Architectural Drawbacks

- Edge platforms don't use your standard Node.js runtime, so you'll need to ensure any libraries you use are capable of running in a "worker environment" and don't depend on Node.js or browser-specific API.
- You'll need to monitor your dependencies closely because by default most edge platforms limit the size of bundles you can deploy to 1 MB.


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
