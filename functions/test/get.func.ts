export default {
  cache: true,
  get(query: Query) {
    return {
      contentType: "application/json",
      body: JSON.stringify(query.name + " " + new Date().toISOString())
    };
  }
};
