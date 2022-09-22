export default {
  GET(request: WorkerRequest) {
    return new Response(`TEST ${new Date().toISOString()}`, {
      headers: { "Content-Type": "text/plain" },
      status: 200
    });
  }
};
