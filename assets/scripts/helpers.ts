export async function callFunction(path: string, query: { [key: string]: string }) {
  return await fetch(path + "?" + new URLSearchParams(query).toString());
}
