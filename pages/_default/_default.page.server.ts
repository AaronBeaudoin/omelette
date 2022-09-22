import { pipeToWebWritable, pipeToNodeWritable } from "vue/server-renderer";
import { escapeInject as escape, stampPipe } from "vite-plugin-ssr";
import { getPageMode, createPageApp } from "./app";
import { ServerPageModeHandler } from "./app";
import { PageContext } from "./types";
import type { Writable } from "stream";

// By default we do not want to pre-render our pages.
// This makes pre-rendering opt-in by adding `doNotPrerender = false` to pages.
export const doNotPrerender = true;

export const passToClient = [
  "urlParsed",
  "pageProps"
];

function pipeToWritable(page: any) {
  const implementations = {
    "web-stream": (writable: WritableStream) => { pipeToWebWritable(page, {}, writable); },
    "node-stream": (writable: Writable) => { pipeToNodeWritable(page, {}, writable); }
  };

  const isWorker = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
  const pipe = implementations[isWorker ? "web-stream" : "node-stream"];
  stampPipe(pipe, isWorker ? "web-stream" : "node-stream");
  return pipe as (writable: WritableStream) => void;
}

export async function onBeforeRender(pageContext: PageContext) {
  let pageProps = {};

  const fetchProps = pageContext.exports.fetchProps as Function | undefined;
  const route = { path: pageContext.urlParsed.pathname, query: pageContext.urlParsed.search };

  if (fetchProps) await fetchProps(pageProps, route, pageContext.fetch);
  return { pageContext: { pageProps: pageProps } };
}

export async function render(pageContext: PageContext) {
  const title = pageContext.exports.title ? pageContext.exports.title + " — " : "";

  const modeHandlers: Record<string, ServerPageModeHandler> = {
    "server-and-client": page => pipeToWritable(page),
    "server-only": page => pipeToWritable(page),
    "client-only": _ => ""
  };

  const page = await createPageApp(pageContext);
  const pageHtml = modeHandlers[getPageMode(pageContext)](page);

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
        <!-- Page is rendered inside this root element. -->
        <div id="page">${pageHtml}</div>
      </body>
    </html>
  `;
}
