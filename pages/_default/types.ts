import { PageContextBuiltIn } from "vite-plugin-ssr";


export type PageContext = PageContextBuiltIn & {
  teleports?: Record<string, string>,
  props: Record<string, any>,
  fetch: typeof fetch,
  route: {
    path: string,
    params: Record<string, string>,
    query: Record<string, string>
  }
};
