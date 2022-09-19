export default {
  cache: true,

  get(request: WorkerRequest) {
    return {
      contentType: "application/json",
      body: JSON.stringify(request.params.name + " " + new Date().toISOString())
    };
  }
};
