export const config: FunctionConfig = {
  type: "builder",
  build: () => [
    { name: "ifast" },
    { name: "xfast" }
  ]
};

export function builder(query: Record<string, string>) {
  return {
    name: query.name || "product",
    date: new Date().toISOString()
  };
};
