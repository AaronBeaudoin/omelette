export default {
  cache: true,
  async get(query: { [key: string]: string }) {
    const response = await fetch("https://content.aryse.com/assets/3e1f689d-e158-4405-b07f-8ca59a811ef2?access_token=62ea5be7-0d8c-440d-aee6-5a5051192649");

    return {
      contentType: response.headers.get("Content-Type"),
      data: (await response.blob()).stream()
    };
  }
};