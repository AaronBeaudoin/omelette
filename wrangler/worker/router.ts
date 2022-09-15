// This file is inspired by the genius `itty-router`.
// https://github.com/kwhitley/itty-router.

type OmeletteRequest = Request & {
  path: string,
  query: { [key: string]: string },
  params: { [key: string]: string }
};

type RouterEntry = {
  method: string,
  pattern: RegExp,
  handlers: Function[]
};

type Handler<TRequest, TArguments extends any[]> = (request: TRequest, ...arbitrary: TArguments) => Promise<any> | any;
type Definer<TRequest, TArguments extends any[]> = (pattern: string, ...handlers: Handler<TRequest, TArguments>[]) => Router<TRequest, TArguments>;

type Router<TRequest, TArguments extends any[]> = { [method: string]: Definer<TRequest, TArguments> } & {
  handle: (request: TRequest, ...arbitrary: any) => Router<TRequest, TArguments>,
  routes: RouterEntry[]
};

function createRoutePattern(pattern: string, base?: string) {
  let patternText = (base || "") + pattern;

  // Not sure what this one is for...
  patternText.replace(/(\/?)\*/g, "($1.*)?");

  // Not sure what this one is for...
  patternText.replace(/\/$/, "");

  // Not sure what this one is for...
  patternText.replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3");

  // Not sure what this one is for...
  patternText.replace(/\.(?=[\w(])/, "\\.");

  // Not sure what this one is for...
  patternText.replace(/\)\.\?\(([^\[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.");

  const result = RegExp(`^${patternText}/*$`);
  return result;
}

export function createRouter<
  TRequest = OmeletteRequest,
  TArguments extends any[] = [Environment, ExecutionContext]
>(
  initialRoutes: RouterEntry[],
  base?: string
) {
  let routes = initialRoutes;
  let router = Object.create(new Proxy({}, {
    get(_, property, receiver) {
      return (routeString: string, ...handlers: Function[]) => {
        routes.push({
          method: (property as string).toUpperCase(),
          pattern: createRoutePattern(routeString, base),
          handlers: handlers
        });

        // Returning `receiver` is like returning `this`,
        // it is what makes the route declarations chainable.
        return receiver;
      };
    }
  }));

  const handler = async (request: OmeletteRequest, ...arbitrary: TArguments) => {
    const url = new URL(request.url);
    request.path = url.pathname;
    request.query = Object.fromEntries(url.searchParams);

    for (let route of routes) {
      const matchMethod = (_: string) => _ === request.method || _ === "ALL";
      if (!matchMethod(route.method)) continue;

      let routeMatch = request.path.match(route.pattern);
      if (!routeMatch) continue;
      request.params = routeMatch.groups || {};

      for (let routeHandler of route.handlers) {
        let response = await routeHandler(request, arbitrary);
        if (response !== undefined) return response;
      }
    }
  };

  router.routes = routes;
  router.handle = handler;
  return router as Router<TRequest, TArguments>;
};
