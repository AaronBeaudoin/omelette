import { pipeToWebWritable, pipeToNodeWritable } from "vue/server-renderer";
import { escapeInject as escape, dangerouslySkipEscape as unescape, stampPipe } from "vite-plugin-ssr";
import { getPageMode, createPageApp } from "./app";
import { ServerPageModeHandler } from "./app";
import { PageContext } from "./types";
import type { Writable } from "stream";

// By default we do not want to pre-render our pages.
// This makes pre-rendering opt-in by adding `doNotPrerender = false` to pages.
export const doNotPrerender = true;

export const passToClient = [
  "urlParsed",
  "props",
  "route"
];

export async function onBeforeRender(pageContext: PageContext) {
  if (!pageContext.exports.props) return;

  const route = { path: pageContext.urlParsed.pathname, query: pageContext.urlParsed.search };
  const props = await (pageContext.exports.props as Function)(route, pageContext.fetch);
  return { pageContext: { props: props || {}, route: route } };
}

function pipeToWritable(page: any, pageContext: PageContext) {
  const implementations = {
    "web-stream": (writable: WritableStream) => { pipeToWebWritable(page, pageContext, writable); },
    "node-stream": (writable: Writable) => { pipeToNodeWritable(page, pageContext, writable); }
  };

  const isWorker = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
  const pipe = implementations[isWorker ? "web-stream" : "node-stream"];
  stampPipe(pipe, isWorker ? "web-stream" : "node-stream");
  return pipe as (writable: WritableStream) => void;
}

export async function render(pageContext: PageContext) {
  const title = pageContext.exports.title ? pageContext.exports.title + " — " : "";

  const modeHandlers: Record<string, ServerPageModeHandler> = {
    "server-and-client": page => pipeToWritable(page, pageContext),
    "server-only": page => pipeToWritable(page, pageContext),
    "client-only": _ => ""
  };

  const page = await createPageApp(pageContext);
  const pageHtml = modeHandlers[getPageMode(pageContext)](page);
  const teleport = (selector: string) => unescape(pageContext.teleports?.[selector] || "");

  return escape`
    <!DOCTYPE html>
    <html lang="en">
      <head>

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">

        <title>${title}Omelette</title>
        <link rel="icon" href="/favicon.png">

      </head>
      <body>

        <div id="top-before">${teleport("#top-before")}</div>
        <div id="top-sticky">${teleport("#top-sticky")}</div>
        <div id="top-after">${teleport("#top-after")}</div>
        <div id="page">${pageHtml}</div>
        <div id="bottom-before">${teleport("#bottom-before")}</div>
        <div id="bottom-sticky">${teleport("#bottom-sticky")}</div>
        <div id="bottom-after">${teleport("#bottom-after")}</div>

      </body>
    </html>
  `;
}
