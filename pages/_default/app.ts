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

export async function getLayoutComponent(name: string | null | undefined) {
  const getComponent = async (_: string) => (await import(`../../layouts/${name}.layout.vue`)).default;
  const Transparent = defineComponent({ render() { return (this.$slots.default as Function)(); } });
  if (name === null) return Transparent;

  if (name === undefined) name = "_default";
  try { return await getComponent(name) as ComponentOptions; }
  catch { return Transparent; }
}

export async function wrapPageComponent(
  LayoutComponent: ComponentOptions,
  PageComponent: ComponentOptions,
  props: Record<string, any>
) {
  const renderLayout = () => h(LayoutComponent, props, { default: renderLayoutDefaultSlot });
  const renderLayoutDefaultSlot = () => h(PageComponent, props);
  return { render: renderLayout };
}

export async function createPageApp(pageContext: PageContext) {
  const layoutName = (pageContext.exports.layout as (string | null | undefined));
  const LayoutComponent = await getLayoutComponent(layoutName);

  const PageComponent = await wrapPageComponent(LayoutComponent, pageContext.Page, pageContext.props);
  const page = (pageContext.exports.mode === "client-only" ? createApp : createSSRApp)(PageComponent);

  page.provide("route", pageContext.route);
  page.provide("fetch", import.meta.env.SSR ? pageContext.fetch : window.fetch);
  return page;
}
