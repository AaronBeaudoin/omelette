export default {
  get(query: { [key: string]: string }) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        hello: query.test || "world"
      })
    };
  }
};
