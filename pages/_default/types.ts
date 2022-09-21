import { PageContextBuiltIn } from "vite-plugin-ssr";


export type PageContext = PageContextBuiltIn & {
  pageProps: Record<string, unknown>,
  fetch: typeof fetch
};
