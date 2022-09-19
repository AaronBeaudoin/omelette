export default {
  cache: true,

  GET(request: WorkerRequest) {
    return new Response(JSON.stringify(request.params.name + " " + new Date().toISOString()), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  }
};
