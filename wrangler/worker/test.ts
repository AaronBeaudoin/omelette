import { createRouter } from "./router";

const router = createRouter([]);

router.get("*", async (request, env, context) => {
});

export default {
  fetch: router.handle
};
