import { renderPage } from "vite-plugin-ssr";

export default async function handler(request, response) {
  console.log("Request to url:", request.url );

  const pageContext = await renderPage({ url: request.url  });
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
