export async function http(endpoint, options = {}) {
  const res = await fetch(`${process.env.API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}