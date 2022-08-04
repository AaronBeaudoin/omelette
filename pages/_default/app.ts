import { createSSRApp, createApp, h } from "vue";
import { App, Component, DefineComponent } from "vue";
import { PageContext } from "./types";
import LayoutComponent from "/components/Layout.vue";

export type PageMode = "server-and-client" | "server-only" | "client-only";
export type ServerPageModeHandler = (page: App<Element>) => Promise<string>;
export type ClientPageModeHandler = (page: App<Element>) => Component | undefined;

export function getPageMode(pageContext: PageContext) {
  const modes = ["server-and-client", "server-only", "client-only"];
  const mode = pageContext.exports.mode as string;
  return (modes.includes(mode) ? mode : modes[0]) as PageMode;
}

export function wrapPageComponent(PageComponent: DefineComponent, props = {}) {
  const renderLayout = () => h(LayoutComponent, props || {}, { default: renderLayoutDefaultSlot });
  const renderLayoutDefaultSlot = () => h(PageComponent, props || {});
  return { render: renderLayout };
}

export function createPageApp(pageContext: PageContext) {
  const PageComponent = wrapPageComponent(pageContext.Page, pageContext.pageProps);
  const page = (pageContext.exports.mode === "client-only" ? createApp : createSSRApp)(PageComponent);

  page.provide("pageContext", pageContext);
  return page;
}
