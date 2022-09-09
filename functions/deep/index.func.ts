export default {
  cache: true,
  get(query: { [key: string]: string }) {
    return {
      contentType: "application/json",
      data: JSON.stringify({
        hello: query.test || "world"
      })
    };
  }
};
