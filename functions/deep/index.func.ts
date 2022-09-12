export default {
  cache: true,
  get() {
    return {
      contentType: "text/plain",
      data: new Date().toISOString()
    };
  }
};
