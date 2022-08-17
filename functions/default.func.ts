export function handler(query: FunctionQuery) {
  return {
    name: query.name || "default",
    date: new Date().toISOString()
  };
};
