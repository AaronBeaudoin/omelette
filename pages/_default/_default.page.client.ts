import { getPageMode, createPageApp } from "./app";
import { ClientPageModeHandler } from "./app";
import { PageContext } from "./types";

export async function render(pageContext: PageContext) {
  const modeHandlers: Record<string, ClientPageModeHandler> = {
    "server-and-client": page => page.mount("#page"),
    "client-only": page => page.mount("#page"),
    "server-only": page => undefined
  };

  const page = createPageApp(pageContext);
  modeHandlers[getPageMode(pageContext)](page);
}
