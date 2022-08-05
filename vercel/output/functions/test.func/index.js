/**
 * @param {Request} request
 */
export default async function index(request, event) {
  console.log("[test]");
  console.log(request.url);
  console.log(Array.from(request.headers.entries()));
  console.log(await request.text());

  return new Response(`Hello, from the Edge test!`);
}
