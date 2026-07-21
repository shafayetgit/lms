import { removeAuthCookie, setAuthCookie } from "@/lib/auth/cookie"
import { getCookie } from "@/utils/shared"
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: headers => {
    const accessToken = getCookie("accessToken")
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
    return headers
  },
})

const baseQuery = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 403) {
    const method = typeof args === "string" ? "GET" : args?.method || "GET"
    if (method.toUpperCase() === "GET") {
      const errorMsg =
        result.error?.data?.detail ||
        result.error?.data?.message ||
        "It looks like you don't have the required authorization or roles to view this page. Please check with your administrator or try logging in with a different account."
      if (typeof window !== "undefined") {
        window.location.href = `/forbidden?message=${encodeURIComponent(errorMsg)}`
      }
      return result
    }
  }

  if (result.error?.status !== 401) return result

  const url = typeof args === "string" ? args : args?.url
  if (url && url.includes("auth/token")) return result

  const refreshToken = getCookie("refreshToken")
  if (!refreshToken) {
    removeAuthCookie()
    if (typeof window !== "undefined" && window.location.pathname !== "/auth/sign-in") {
      window.location.href = "/auth/sign-in"
    }
    return result
  }

  const refreshResult = await rawBaseQuery(
    {
      url: `api/v1/auth/refresh`,
      method: "POST",
      body: { refresh_token: refreshToken },
    },
    api,
    extraOptions
  )

  if (refreshResult.data) {
    setAuthCookie(refreshResult.data)
    result = await rawBaseQuery(args, api, extraOptions)
  } else {
    removeAuthCookie()
    if (typeof window !== "undefined" && window.location.pathname !== "/auth/sign-in") {
      window.location.href = "/auth/sign-in"
    }
  }

  return result
}

export default baseQuery
