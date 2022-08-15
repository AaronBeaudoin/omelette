import { renderToString } from "vue/server-renderer";
import { escapeInject as escape } from "vite-plugin-ssr";
import { dangerouslySkipEscape as unescape } from "vite-plugin-ssr";
import { getPageMode, createPageApp } from "./app";
import { ServerPageModeHandler } from "./app";
import { PageContext } from "./types";

// By default we do not want to pre-render our pages.
// This makes pre-rendering opt-in by adding `doNotPrerender = false` to pages.
export const doNotPrerender = true;

export const passToClient = [
  "urlParsed",
  "pageProps"
];

export async function render(pageContext: PageContext) {
  const title = pageContext.exports.title ? pageContext.exports.title + " — " : "";
  const faviconUrl = import.meta.env.BASE_URL + "logo.svg";

  const modeHandlers: Record<string, ServerPageModeHandler> = {
    "server-and-client": async page => await renderToString(page),
    "server-only": async page => await renderToString(page),
    "client-only": async _ => ""
  };

  const page = await createPageApp(pageContext);
  const pageHtml = await modeHandlers[getPageMode(pageContext)](page);

  return escape`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
        <title>${title}VPS Starter</title>
        <link rel="icon" href="${faviconUrl}">
      </head>
      <body>
        <!-- Page is rendered inside this root element. -->
        <div id="page">${unescape(pageHtml)}</div>
      </body>
    </html>
  `;
}
