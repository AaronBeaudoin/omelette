export default function index(request, event) {
  console.log("[test]");
  console.log(JSON.stringify(request, null, 2));
  console.log(JSON.stringify(event, null, 2));

  return new Response(`Hello, from the Edge test!`);
}
