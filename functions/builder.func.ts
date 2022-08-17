export function builder(query: FunctionQuery) {
  return {
    name: query.name || "builder",
    date: new Date().toISOString()
  };
};
