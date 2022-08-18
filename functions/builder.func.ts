export async function builder(query: FunctionQuery) {
  console.log(JSON.stringify(query));

  return {
    name: query.name || "builder",
    date: new Date().toISOString()
  };
};
