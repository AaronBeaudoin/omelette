export async function handler(query: FunctionQuery) {
  return {
    name: query.name || "deep/default",
    date: new Date().toISOString()
  };
};
