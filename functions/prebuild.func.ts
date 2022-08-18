export async function builder(query: FunctionQuery) {
  return {
    name: query.name || "prebuild",
    date: new Date().toISOString()
  };
};

export async function prebuild() {
  return [
    { name: "success" }
  ];
}
