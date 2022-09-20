export default {
  cache: true,

  async GET(request: WorkerRequest) {
    return await fetch("https://content.aryse.com/assets/3e1f689d-e158-4405-b07f-8ca59a811ef2?access_token=62ea5be7-0d8c-440d-aee6-5a5051192649");
  }
};
