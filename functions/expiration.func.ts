export const expiration = 5;
export async function builder(query: FunctionQuery) {
  return {
    name: query.name || "expiration",
    date: new Date().toISOString()
  };
};
