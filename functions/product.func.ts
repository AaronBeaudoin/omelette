export const config: FunctionConfig = {
  route: "/product",
  type: "builder",
  build: () => [
    { name: "ifast" },
    { name: "xfast" }
  ]
};

export function handler(query: Record<string, string>) {
  return {
    name: query.name || "default",
    date: new Date().toISOString()
  };
};
