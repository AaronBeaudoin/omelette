export default {
  async get(query: Query, fetch: Fetch) {
    return {
      contentType: "application/json",
      body: JSON.stringify(await Promise.all([
        "Product A",
        "Product B",
        "Product C"
      ].map(async name => {
        let response = await fetch(`/fn/test/get?name=${name}`, { preview: true });
        return await response.json();
      })))
    };
  }
};
