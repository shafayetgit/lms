import { removeCookie, setCookie } from "@/utils/shared"

const AUTH_KEYS = ["user", "accessToken", "refreshToken", "profileSetupComplete", "auth", "emailVerified"]

export const setAuthCookie = (payload) => {
  const { accessToken, access_token, refreshToken, refresh_token, user, emailVerified } = payload
  const finalAccessToken = accessToken || access_token
  const finalRefreshToken = refreshToken || refresh_token

  if (emailVerified !== undefined) {
    setCookie("emailVerified", emailVerified.toString())
  }

  if (user !== undefined) {
    setCookie("user", JSON.stringify(user))
  }

  if (finalAccessToken !== undefined) {
    setCookie("accessToken", finalAccessToken)
  }

  if (finalRefreshToken !== undefined) {
    setCookie("refreshToken", finalRefreshToken)
  }

}

export const removeAuthCookie = () => {
  AUTH_KEYS.forEach(key => {
    removeCookie(key)
  })
}

