import { getTransformedRoutes } from "@vercel/routing-utils";

console.log(getTransformedRoutes({
  "rewrites": [
    {
      "source": "/direct/(.*)",
      "destination": "/direct"
    },
    {
      "source": "/(.*)",
      "destination": "/prerender"
    }
  ]
}));
