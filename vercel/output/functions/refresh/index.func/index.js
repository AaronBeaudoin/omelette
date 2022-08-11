/**
 * @param {import("@vercel/node").VercelRequest} request
 * @param {import("@vercel/node").VercelResponse} response
 */
module.exports = (request, response) => {
  console.log("[refresh]");
  response.send("[refresh]");
};
