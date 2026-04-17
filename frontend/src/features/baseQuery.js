import { getCookie } from "@/utils/shared";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  const url = typeof args === "string" ? args : args?.url;
  if (url && url.includes("auth/login")) return result;

  const refreshToken = getData("refreshToken");

  if (!refreshToken) {
    removeAuthData();
    window.location.href = "/auth/login";
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: "/auth/refresh",
      method: "POST",
      body: { refresh: refreshToken },
    },
    api,
    extraOptions,
  );

  if (refreshResult.data) {
    setAuthData(refreshResult.data);
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    removeAuthData();
    window.location.href = "/auth/login";
  }

  return result;
};

export default baseQuery