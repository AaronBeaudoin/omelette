import { renderPage } from "vite-plugin-ssr";

/**
 * @param {import("@vercel/node").VercelRequest} request 
 * @param {import("@vercel/node").VercelResponse} response 
 */
export default async function handler(request, response) {
  console.log("[default]");
  console.log(request.method, request.url, request.httpVersion);
  console.log(JSON.stringify(request.query, null, 2));
  console.log(JSON.stringify(request.headers, null, 2));
  console.log(JSON.stringify(request.cookies, null, 2));
  console.log(request.body);

  const pageContext = await renderPage({ url: request.url });
  const { httpResponse } = pageContext;

  if (!httpResponse) {
    response.statusCode = 200;
    response.end();
  } else {
    const { body, statusCode, contentType } = httpResponse;

    response.statusCode = statusCode;
    response.setHeader("Content-Type", contentType);
    response.end(body);
  }
}
