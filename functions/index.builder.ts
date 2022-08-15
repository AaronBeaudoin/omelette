export function handler(query = {}) {
  return {
    some: "data",
    date: new Date().toISOString()
  };
};

export function build() {
  return [
    { name: "ifast" },
    { name: "xfast" }
  ];
}
