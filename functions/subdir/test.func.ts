export function handler(query: Record<string, string>) {
  return {
    name: (query.name) || "test",
    date: new Date().toISOString()
  };
};
