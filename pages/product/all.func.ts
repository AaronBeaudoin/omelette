export default {
  async GET(request: WorkerRequest) {
    return new Response(JSON.stringify(await Promise.all(["A", "B", "C"].map(async name => {
      let response = await request.fetch(`/product/${name}`);
      return await response.json();
    }))), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  }
};
