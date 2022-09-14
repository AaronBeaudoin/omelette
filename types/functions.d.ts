type Query = { [key: string]: string };
type FetchInit = RequestInit & { preview?: true, refresh?: true };
type Fetch = (input: string | Request, options?: FetchInit) => Promise<Response>;
