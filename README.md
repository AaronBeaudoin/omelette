<br> <!-- ———————————————————————————————————————————————————————————————————————————————————————————————————— -->


# 🍳 Omelette

**Omelette** is an opinionated _recipe_ that [demonstrates](https://omelette.snackbar.workers.dev) how to build a fast dynamic website/application. It was created as a foundation for a real-world ecommerce website and jump-starts you with:

- A **flexible architecture** suitable for production websites.
- Hand-picked **tools and libraries** for painless development.
- A cost-effective and scalable **preset deployment platform**.


## Core Ingredients

- 🍯 — [**`brillout/vite-plugin-ssr`**](https://vite-plugin-ssr.com) — The binding agent that makes everything stick!
- 🥘 — [**`vitejs/vite`**](https://vitejs.dev) — The base that gives the recipe its delicious flavor.
- 🍫 — [**`vuejs/core`**](https://vuejs.org) — The sweetener that makes the recipe so good.
- 🍇 — [**`unocss/unocss`**](https://uno.antfu.me) — The garnish for decorating the recipe.
- 🍽 — [**Cloudflare Workers**](https://workers.cloudflare.com) — The dish for serving the recipe.

For a less silly deep dive into the reasoning behind why these ingredients were chosen over potential alternatives, see the [**chemistry**](#-the-chemistry) section below. The section also explains some of the recipe's custom features.


<br> <!-- ———————————————————————————————————————————————————————————————————————————————————————————————————— -->


## 📙 Table of Contents

- [**Getting Started**](#-getting-started)  
  Start exploring Omelette for yourself!
- [**Deployment**](#-deployment)  
  Learn how to deploy an Omelette project.
- [**The Chemistry**](#-the-chemistry)  
  Learn why each ingredient was chosen.


<br> <!-- ———————————————————————————————————————————————————————————————————————————————————————————————————— -->


## 🐣 Getting Started

1. **Clone** this repository.

    ```
    $ git clone https://github.com/AaronBeaudoin/omelette
    ```

2. **Install** project dependencies.

    ```
    $ npm install
    ```

3. **Run** the development setup.

    ```
    $ npm run dev
    ```

4. **Explore** the project and make it your own! ✨


<br> <!-- ———————————————————————————————————————————————————————————————————————————————————————————————————— -->


## 🚀 Deployment

1. **Create a Cloudflare account** [here](https://dash.cloudflare.com/sign-up) if you don't already have one. After doing so, make sure to go to the **Workers** page in the dashboard and complete the setup steps.

2. **Login to [Wrangler](https://developers.cloudflare.com/workers/wrangler/get-started)**, the CLI for working with Cloudflare Workers.

    ```
    $ npx wrangler login
    ```

3. **Create a [Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works) namespace** for production and another one for preview.

    ```
    $ npx wrangler kv:namespace create PRODUCTION
    $ npx wrangler kv:namespace create PREVIEW
    ```

4. **Bind the namespaces** to `FUNCTIONS` in your worker environment. To do this, replace `id` under `[[kv_namespaces]]` in your `wrangler.toml` config with the ID of the `PRODUCTION` namespace you just created and replace `preview_id` with the ID of the `PREVIEW` namespace.

    ```toml
    [[kv_namespaces]]
    id = "<your-production-namespace-id-here>"
    preview_id = "<your-preview-namespace-id-here>"
    binding = "FUNCTIONS"
    ```

   The ID for each namespace should be in the terminal output under each command from the last step. If you can't find them, you can easily get them again via another command.

   ```
   $ npx wrangler kv:namespace list
   ```

5. **Update the name** of your worker in your `wrangler.toml` config to whatever you want.

6. **Create a [Workers Secret](https://developers.cloudflare.com/workers/platform/environment-variables/#adding-secrets-via-wrangler)** named `SECRET` to enable function `?preview=` and `?refresh=`.

    ```
    $ npx wrangler secret put SECRET
    ```

7. **Preview your build output** before actually deploying, if you want.

    ```
    $ npm run preview
    ```

8. **Deploy your project** and sit back and relax! Watch a movie. Whatever you want! 🍹

    ```
    $ npm run deploy
    ```


### Deploy on Push — _Optional_

1. **Create an API token** in your Cloudflare account [here](https://dash.cloudflare.com/profile/api-tokens). If you're not sure exactly what permissions you want, just use the **Edit Cloudflare Workers** template.

2. **Copy the token into a [GitHub Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)** called `CLOUDFLARE_API_TOKEN` under your repository.

3. **Copy your account ID into a [GitHub Secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)** called `CLOUDFLARE_ACCOUNT_ID` under your repository. You can find your Cloudflare account ID on the right hand side of the **Workers** page in the dashboard.

4. **Push a new commit!** From now on, pushing to the `main` branch of your repository should use the `.github/workflows/deploy.yaml` [GitHub Action](https://docs.github.com/en/actions) to deploy your project automatically!


<br> <!-- ———————————————————————————————————————————————————————————————————————————————————————————————————— -->


## 🥼 The Chemistry

This section is a _work in progress_.


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

-->
