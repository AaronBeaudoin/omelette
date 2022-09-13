export default {
  async get(query: { [key: string]: string }, call: typeof fetch) {
    return {
      contentType: "application/json",
      body: JSON.stringify(await Promise.all([
        "Product A",
        "Product B",
        "Product C"
      ].map(async name => {
        let response = await call(`/fn/test/get?name=${name}`);
        return await response.json();
      })))
    };
  }
};
