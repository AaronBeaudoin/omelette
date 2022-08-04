import pathTools from "path";
import glob from "glob";
import vite from "vite";
import VitePluginUnoCSS from "unocss/vite";
import VitePluginVue from "@vitejs/plugin-vue";
import VitePluginVueComponents from "unplugin-vue-components/vite";
import VitePluginIcons from "unplugin-icons/vite";
import VitePluginAutoImport from "unplugin-auto-import/vite";
import VitePluginSSR from "vite-plugin-ssr/plugin";
import IconResolver from "unplugin-icons/resolver";

export default vite.defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  plugins: [
    VitePluginUnoCSS({
      mode: "vue-scoped",
      presets: [],
      rules: [
        [/^bg-([a-z]+)$/, match => ({
          "background-color": match[1]
        })]
      ]
    }),
    VitePluginVue({
      reactivityTransform: true
    }),
    VitePluginVueComponents({
      dts: "types/components.d.ts",
      resolvers: [
        name => {
          if (!name.startsWith("My")) return;
          let filename = name.slice(2) + ".vue";
          let globPath = pathTools.join(__dirname, "components", "**", filename);
        
          let paths = glob.sync(globPath);
          if (paths.length === 1) return paths[0];
        },
        IconResolver({
          prefix: "Icon",
          alias: {
            hero24: "heroicons-outline",
            hero20: "heroicons-solid"
          }
        })
      ]
    }),
    VitePluginIcons({
      iconCustomizer(collection, _, props) {
        if (collection === "heroicons-outline") props.width = props.height = "24px";
        if (collection === "heroicons-solid") props.width = props.height = "20px";
      }
    }),
    VitePluginAutoImport({
      dts: "types/auto.d.ts",
      imports: [
        {
          "vue": ["ref"],
          "vue/macros": ["$ref"]
        }
      ]
    }),
    VitePluginSSR({
      prerender: true,
      includeAssetsImportedByServer: true
    })
  ]
});
