export function builder(query: FunctionQuery) {
  return {
    name: query.name || "deep/builder",
    date: new Date().toISOString()
  };
};
