export default {
  async GET(request: WorkerRequest) {
    return await request.fetch("https://cataas.com/cat");
  }
};
