import { removeCookie, setCookie } from "@/utils/shared"

const AUTH_KEYS = ["user", "accessToken", "refreshToken", "profileSetupComplete", "auth", "emailVerified"]

export const setAuthCookie = (payload) => {
  const { accessToken, refreshToken, user, emailVerified } = payload

  if (emailVerified !== undefined) {
    setCookie("emailVerified", emailVerified.toString())
  }

  if (user !== undefined) {
    setCookie("user", JSON.stringify(user))
  }

  if (accessToken !== undefined) {
    setCookie("accessToken", accessToken)
  }

  if (refreshToken !== undefined) {
    setCookie("refreshToken", refreshToken)
  }

}

export const removeAuthCookie = () => {
  AUTH_KEYS.forEach(key => {
    removeCookie(key)
  })
}

