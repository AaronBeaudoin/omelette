export default {
  async get(query: { [key: string]: string }) {
    return {
      contentType: "application/json",
      body: JSON.stringify(query.name + " Extra")
    };
  }
};
