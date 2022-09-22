import pathTools from "path";
import glob from "glob";
import fetch from "node-fetch";
import { defineConfig } from "vite";
import { renderPage } from "vite-plugin-ssr";
import { transformerVariantGroup } from "unocss";
import VitePluginAutoImport from "unplugin-auto-import/vite";
import VitePluginIcons from "unplugin-icons/vite";
import VitePluginUnoCSS from "unocss/vite";
import VitePluginVue from "@vitejs/plugin-vue";
import VitePluginMarkdown from "vite-plugin-md";
import VitePluginSVG from "vite-svg-loader";
import VitePluginVueComponents from "unplugin-vue-components/vite";
import VitePluginSSR from "vite-plugin-ssr/plugin";
import IconResolver from "unplugin-icons/resolver";

export default defineConfig({
  server: {

    // Allow the server to be accessed from any machine on the local network by default.
    // It is your responsibility to ensure you are on a secure network that you trust.
    // This is the default to allow easy testing on your phone or other mobile devices.
    host: "0.0.0.0",

    // Vite now uses port 5173 to avoid collisions with other tools.
    // What a weird number to try and remember. We'll stick with 3000.
    port: 3000
  },
  plugins: [


    // The `unplugin-auto-import` plugin enables auto-imports.
    VitePluginAutoImport({

      // Here we register the imports which we would like to make
      // automatically available across our entire project.
      imports: [
        {
          "vue": ["ref"]
        }
      ],

      // Generate a TypeScript `.d.ts` file for auto-imports.
      dts: "types/auto.d.ts"
    }),


    // The `unplugin-icons` plugin enabled easy access to icons from Iconify.
    VitePluginIcons({

      // Properly set the width and height for heroicons.
      iconCustomizer(collection, _, props) {
        if (collection === "heroicons-outline") props.width = props.height = "24px";
        if (collection === "heroicons-solid") props.width = props.height = "20px";
      }
    }),


    // The `unocss` plugin is an atomic CSS engine.
    // It is a more configurable alternative to Tailwind CSS.
    VitePluginUnoCSS({

      // You may be tempted to switch to `vue-scoped`, but don't do it, because
      // it causes CSS to be loaded along with the components during hydration,
      // resulting in ugly layout shift, especially for `layout` components.
      mode: "global",

      // Enables support for https://windicss.org/features/variant-groups.html.
      transformers: [transformerVariantGroup()],

      // Look for class names in both `.vue` files and `.md` files.
      include: [/\.vue$/, /\.md$/]
    }),


    // The `@vitejs/plugin-vue` plugin enabled Vue support.
    VitePluginVue({
      
      // The Vite Vue plugin `reactivityTransform` property enables "ref sugar" in
      // Vue SFCs as described here: https://github.com/vuejs/rfcs/discussions/369
      reactivityTransform: true,

      // Include both `.vue` files and `.md` files as Vue components.
      include: [/\.vue$/, /\.md$/]
    }),


    // The `vite-plugin-md` plugin enables importing markdown files as Vue components.
    // It also enables using Vue components inside of markdown files.
    VitePluginMarkdown(),
    

    // The `vite-svg-loader` plugin enables importing SVGs as Vue components.
    VitePluginSVG(),
    

    // The `unplugin-vue-components` plugin enables component auto-importing.
    VitePluginVueComponents({

      // Here we define our "resolvers", which are responsible for
      // finding the components we want to be able to auto-import.
      resolvers: [

        // This custom resolver allows us to auto-import components from
        // our `components` directory as Vue components like `<My{ExampleName}>`.
        // Component filenames should be in title case like `ExampleName.vue`.
        // Example: Import `CustomButton.vue` like `<MyCustomButton/>`.
        name => {
          const prefix = "My";
          if (!name.startsWith(prefix)) return;

          const filename = name.slice(prefix.length) + ".{vue,md}";
          const globPath = pathTools.join(__dirname, "components", "**", filename);

          const paths = glob.sync(globPath);
          if (paths.length === 1) return paths[0];
        },

        // This custom resolver allows us to auto-import SVGs from our
        // `assets/vectors` directory as Vue components like `<Vector{ExampleName}>`.
        // SVG filenames should be in kebab case like `example-name.svg`.
        // Example: Import `company-logo.svg` like `<VectorCompanyLogo/>`.
        name => {
          const prefix = "Vector";
          if (!name.startsWith(prefix)) return;

          const toKebabCase = (text: string) => {
            return text.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (match, offset) => {
              return (offset ? "-" : "") + match.toLowerCase();
            });
          };

          const filename = toKebabCase(name.slice(prefix.length)) + ".svg";
          return pathTools.join(__dirname, "assets/vectors", `${filename}?component`);
        },

        // This resolver is provided by the `unplugin-icons` plugin and allows
        // us to auto-import icons as Vue components like `<Icon{Collection}{IconName}>`.
        IconResolver({
          prefix: "Icon",
          alias: {
            hero24: "heroicons-outline",
            hero20: "heroicons-solid"
          }
        })
      ],

      // Generate a TypeScript `.d.ts` file for auto-imported components.
      dts: "types/components.d.ts",

      // Auto import in both `.vue` files and `.md` files.
      include: [/\.vue$/, /\.md$/]
    }),


    // The `dev-function-proxy` plugin forwards requests to `wrangler` during development.
    // `X-Function-Proxy: MISS` means that `response` in the worker handler was `undefined`.
    // With this plugin order, functions take precedence over pages like in production.
    {
      name: "dev-function-proxy",
      configureServer(server) {
        return () => {
          server.middlewares.use(async (request, response, next) => {
            const fetchHeaders: [string, string][] = request.rawHeaders.reduce((result, _, index, raw) => {
              if (!(index % 2)) return result;
              const pair = raw.slice(index-1, index+1);
              return result.concat([pair as never]);
            }, []);

            const fetchConfig = { method: request.method, headers: fetchHeaders };
            const workerResponse = await fetch("http://localhost:8787" + request.url, fetchConfig);
            if (workerResponse.headers.get("X-Function-Proxy") === "MISS") return next();

            workerResponse.headers.forEach((value, key) => response.setHeader(key, value));
            response.writeHead(workerResponse.status);
            response.end(await workerResponse.buffer());
          });
        };
      }
    },


    // The `dev-render-page` plugin runs before the built-in `vite-plugin-ssr` middleware
    // for rendering page routes, overriding it by writing a response before the built-in
    // middleware gets the chance. The purpose is to supply a custom `fetch` function to
    // the page via `initialPageContext` without a custom Express server script.
    {
      name: "dev-render-page",
      configureServer(server) {
        return () => {
          server.middlewares.use(async (request, response, next) => {
            if (response.headersSent) return next();
            if (!request.originalUrl && !request.url) return next();

            const initialPageContext = {
              urlOriginal: request.originalUrl || request.url,
              fetch: async (input: any, options?: any) => {
                if (!options) options = {};

                if (typeof input !== "string") return await fetch(input, options);
                if (!input.startsWith("/")) return await fetch(input, options);

                let requestUrl = new URL("http://" + request.headers["host"] + input);
                if (options.preview) requestUrl.searchParams.append("preview", "");
                if (options.refresh) requestUrl.searchParams.append("refresh", "");
                return await fetch(requestUrl, options);
              }
            };

            const pageContext = await renderPage(initialPageContext);
            if (!pageContext.httpResponse) return next();

            response.setHeader("Content-Type", pageContext.httpResponse.contentType);
            response.writeHead(pageContext.httpResponse.statusCode);
            pageContext.httpResponse.pipe(response);
          });
        };
      }
    },


    // The `vite-plugin-ssr` plugin enables SSR.
    // It is a lightweight, configurable alternative to Next/Nuxt.js.
    VitePluginSSR({

      // We enable pre-rendering at a global level and set `doNotPrerender = true` in
      // `_default.page.server.ts` so we can opt-in to pre-rendering on a per-page basis.
      prerender: true
    })


  ]
});
