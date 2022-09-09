import { createSSRApp, createApp, h, defineComponent } from "vue";
import { App, Component, ComponentOptions } from "vue";
import { PageContext } from "./types";

export type PageMode = "server-and-client" | "server-only" | "client-only";
export type ServerPageModeHandler = (page: App<Element>) => ((writable: WritableStream) => void) | string;
export type ClientPageModeHandler = (page: App<Element>) => Component | undefined;

export function getPageMode(pageContext: PageContext) {
  const modes = ["server-and-client", "server-only", "client-only"];
  const mode = pageContext.exports.mode as string;
  return (modes.includes(mode) ? mode : modes[0]) as PageMode;
}

export async function getLayoutComponent(name?: string) {
  try { return (await import(`../../layouts/${name || "default"}.layout.vue`)).default as ComponentOptions; }
  catch { return defineComponent({ render() { return this.$slots.default && this.$slots.default(); } }); }
}

export async function wrapPageComponent(
  LayoutComponent: ComponentOptions,
  PageComponent: ComponentOptions,
  props = {}
) {
  const renderLayout = () => h(LayoutComponent, props || {}, { default: renderLayoutDefaultSlot });
  const renderLayoutDefaultSlot = () => h(PageComponent, props || {});
  return { render: renderLayout };
}

export async function createPageApp(pageContext: PageContext) {
  const layoutName = pageContext.exports.layout as (string | undefined);
  const LayoutComponent = await getLayoutComponent(layoutName);

  const PageComponent = await wrapPageComponent(LayoutComponent, pageContext.Page, pageContext.pageProps);
  const page = (pageContext.exports.mode === "client-only" ? createApp : createSSRApp)(PageComponent);

  page.provide("pageContext", pageContext);
  return page;
}
