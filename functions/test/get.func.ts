export default {
  cache: true,
  get(query: { [key: string]: string }) {
    return {
      contentType: "application/json",
      body: JSON.stringify(query.name + " " + new Date().toISOString())
    };
  }
};
