export default {
  get(query: Query) {
    return {
      contentType: "application/json",
      body: JSON.stringify({
        hello: query.test || "world"
      })
    };
  }
};
