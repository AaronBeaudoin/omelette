export default {
  cache: true,
  get() {
    return {
      contentType: "text/plain",
      body: new Date().toISOString()
    };
  }
};
