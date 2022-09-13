export default {
  async get(query: { [key: string]: string }, call: any) {
    return {
      contentType: "application/json",
      body: JSON.stringify(await Promise.all([
        "Product A",
        "Product B",
        "Product C"
      ].map(async name => {
        let response = await call(`/fn/test/get?name=${name}`, { preview: true });
        return await response.json();
      })))
    };
  }
};
