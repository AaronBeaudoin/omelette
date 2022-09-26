import { getPageMode, createPageApp } from "./app";
import { ClientPageModeHandler } from "./app";
import { PageContext } from "./types";

// Styling-related imports.
import "@unocss/reset/tailwind.css";
import "/assets/styles/index.css";
import "uno.css";

export async function render(pageContext: PageContext) {
  const modeHandlers: Record<string, ClientPageModeHandler> = {
    "server-and-client": page => page.mount("#page"),
    "client-only": page => page.mount("#page"),
    "server-only": _ => undefined
  };

  const page = await createPageApp(pageContext);
  modeHandlers[getPageMode(pageContext)](page);
}
