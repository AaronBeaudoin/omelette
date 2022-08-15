import pathTools from "path";
import glob from "glob";
import { defineConfig } from "vite";
import VitePluginAutoImport from "unplugin-auto-import/vite";
import VitePluginIcons from "unplugin-icons/vite";
import VitePluginUnoCSS from "unocss/vite";
import VitePluginVue from "@vitejs/plugin-vue";
import VitePluginMarkdown from "vite-plugin-md";
import VitePluginSVG from "vite-svg-loader";
import VitePluginVueComponents from "unplugin-vue-components/vite";
import VitePluginSSR from "vite-plugin-ssr/plugin";
import IconResolver from "unplugin-icons/resolver";
import { transformerVariantGroup } from "unocss";

export default defineConfig({
  server: {

    // Allow the server to be accessed from any machine on the local network by default.
    // It is your responsibility to ensure you are on a secure network that you trust.
    // This is the default to allow easy testing on your phone or other mobile devices.
    host: "0.0.0.0",

    // Vite now uses port 5173 to avoid collisions with other tools.
    // What a weird number to try and remember. How about we stick to 3000?
    port: 3000

  },
  plugins: [

    // The `unplugin-auto-import` plugin enables auto-imports.
    VitePluginAutoImport({

      // Generate a TypeScript `.d.ts` file for auto-imports.
      dts: "types/auto.d.ts",

      imports: [
        {
          "vue": ["ref"],
          "vue/macros": ["$ref"]
        }
      ]
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

      // Look for class names in both `.vue` files and `.md` files.
      include: [/\.vue$/, /\.md$/],

      // This mode scopes atomic CSS classes in a Vue SFC to that component by
      // injecting the generated CSS in the the SFC's `<style scoped>` element.
      mode: "vue-scoped",

      // Enables support for https://windicss.org/features/variant-groups.html.
      transformers: [transformerVariantGroup()]
    }),

    // The `@vitejs/plugin-vue` plugin enabled Vue support.
    VitePluginVue({

      // Include both `.vue` files and `.md` files as Vue components.
      include: [/\.vue$/, /\.md$/],

      // The Vite Vue plugin `reactivityTransform` property enables "ref sugar" in
      // Vue SFCs as described here: https://github.com/vuejs/rfcs/discussions/369
      reactivityTransform: true
    }),

    // The `vite-plugin-md` plugin enables importing markdown files as Vue components.
    // It also enables using Vue components inside of markdown files.
    VitePluginMarkdown(),
    
    // The `vite-svg-loader` plugin enables importing SVGs as Vue components.
    VitePluginSVG(),
    
    // The `unplugin-vue-components` plugin enables component auto-importing.
    VitePluginVueComponents({

      // Auto import in both `.vue` files and `.md` files.
      include: [/\.vue$/, /\.md$/],

      // Generate a TypeScript `.d.ts` file for auto-imported components.
      dts: "types/components.d.ts",

      // Here we define our "resolvers", which are responsible for
      // finding the components we want to be able to auto-import.
      resolvers: [

        // This custom resolver allows us to auto-import components from
        // our `components` directory as Vue components like `<My{Name}>`.
        name => {
          const prefix = "My";
          if (!name.startsWith(prefix)) return;

          const filename = name.slice(prefix.length) + "{.vue,.md}";
          const globPath = pathTools.join(__dirname, "components", "**", filename);

          const paths = glob.sync(globPath);
          if (paths.length === 1) return paths[0];
        },

        // This custom resolver allows us to auto-import SVGs from our
        // `assets/vectors` directory as Vue components like `<Vector{Name}>`.
        name => {
          const prefix = "Vector";
          if (!name.startsWith(prefix)) return;

          const toKebabCase = (text: string) => {
            return text.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (match, offset) => {
              return (offset ? "-" : "") + match.toLowerCase();
            });
          };

          const filename = toKebabCase(name.slice(prefix.length)) + ".svg";
          return pathTools.join(__dirname, "assets/svgs", `${filename}?component`);
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
      ]
    }),

    // The `vite-plugin-ssr` plugin enables SSR.
    // It is a lightweight, configurable alternative to Next/Nuxt.js.
    VitePluginSSR({

      // We enable pre-rendering at a global level and set `doNotPrerender = true` in
      // `_default.page.server.ts` so we can opt-in to pre-rendering on a per-page basis.
      prerender: true
    })
  ]
});
