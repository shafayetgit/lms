import { removeAuthCookie, setAuthCookie } from "@/lib/auth/cookie";
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
  if (url && url.includes("auth/sign-in")) return result;

  const refreshToken = getCookie("refreshToken");
  if (!refreshToken) {
    removeAuthCookie();
    if (typeof window !== "undefined") window.location.href = "/auth/sign-in";
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
    setAuthCookie(refreshResult.data);
    result = await rawBaseQuery(args, api, extraOptions);
  } else {
    removeAuthCookie();
    if (typeof window !== "undefined") window.location.href = "/auth/sign-in";
  }

  return result;
};

export default baseQuery;