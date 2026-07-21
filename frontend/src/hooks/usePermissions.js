import { useState, useEffect, useMemo } from "react"
import { useGetMyPermissionsQuery } from "@/features/auth/authAPI"
import { getCookie, decodeTokenClient } from "@/utils/shared"

/**
 * Central hook for dynamic authorization.
 *
 * Usage:
 *   const { can, hasFeatureFlag, isSuperAdmin, isLoading } = usePermissions()
 *   can("courses", "read")            // true/false
 *   hasFeatureFlag("lms")             // true/false
 *   isSuperAdmin                      // true/false
 */
export function usePermissions() {
  // Never read cookies on the server — always returns null safely
  const token = typeof window !== "undefined" ? getCookie("accessToken") : null
  const [tokenExpired, setTokenExpired] = useState(false)

  const rawDecodedUser = useMemo(() => {
    return token ? decodeTokenClient(token) : null
  }, [token])

  useEffect(() => {
    let active = true
    if (rawDecodedUser && rawDecodedUser.exp) {
      const now = Math.floor(Date.now() / 1000)
      const isExpired = rawDecodedUser.exp < now

      setTimeout(() => {
        if (active) setTokenExpired(isExpired)
      }, 0)

      if (!isExpired) {
        const timeLeft = rawDecodedUser.exp * 1000 - Date.now()
        const timer = setTimeout(() => {
          if (active) setTokenExpired(true)
        }, timeLeft)
        return () => {
          active = false
          clearTimeout(timer)
        }
      }
    } else {
      setTimeout(() => {
        if (active) setTokenExpired(false)
      }, 0)
    }
    return () => {
      active = false
    }
  }, [rawDecodedUser])

  const decodedUser = tokenExpired ? null : rawDecodedUser

  const hasToken = token && decodedUser !== null
  const { data, isLoading, isFetching, isError } = useGetMyPermissionsQuery(undefined, {
    skip: !hasToken,
  })

  const isSuperAdmin = Boolean(
    decodedUser?.is_superadmin ||
    decodedUser?.role === "superadmin" ||
    decodedUser?.sub === "superadmin"
  )

  const permData = data?.data ?? null
  const permissions =
    (permData?.permissions || (permData && typeof permData === "object" ? permData : null)) ?? {}
  const featureFlags = (decodedUser?.feature_flags ?? decodedUser?.flags ?? []).map(f =>
    (typeof f === "object" ? f?.slug : String(f)).toLowerCase()
  )

  /**
   * Check if the current user has a specific action on a resource.
   * @param {string} resource  - e.g. "courses", "categories"
   * @param {"read"|"create"|"write"|"update"|"delete"|"export"|"import"} action
   * @param {object|string|number} [recordOrOwnerId] - Optional record object or owner ID for creator verification
   * @returns {boolean}
   */
  function can(resource, action = "read", recordOrOwnerId = null) {
    if (isSuperAdmin) return true
    if (!resource || resource === "dashboard") return true
    if (!permissions || typeof permissions !== "object") return false

    // Match exact key, singular ("categories" -> "category"), or plural ("course" -> "courses")
    const singular = resource.replace(/ies$/, "y").replace(/s$/, "")
    const plural = resource.endsWith("y") ? resource.slice(0, -1) + "ies" : resource + "s"

    const perm = permissions[resource] || permissions[singular] || permissions[plural]
    if (!perm) return false

    // Handle both 'update' and 'write' key variants
    const actionKey = action === "write" ? "update" : action
    const baseAllowed = Boolean(perm[action] || perm[actionKey])

    if (!baseAllowed) return false

    // Handle only_if_creator constraint verification
    if (perm.only_if_creator) {
      if (action === "create") return true

      if (recordOrOwnerId === null || recordOrOwnerId === undefined) {
        return true
      }

      const ownerId =
        typeof recordOrOwnerId === "object"
          ? (recordOrOwnerId.owner_id ??
            recordOrOwnerId.owner_public_id ??
            recordOrOwnerId.created_by ??
            recordOrOwnerId.created_by_id ??
            recordOrOwnerId.user_id)
          : recordOrOwnerId

      if (ownerId !== null && ownerId !== undefined) {
        const strOwnerId = String(ownerId)
        const userIdentifiers = [
          decodedUser?.id != null ? String(decodedUser.id) : null,
          decodedUser?.public_id != null ? String(decodedUser.public_id) : null,
          decodedUser?.sub != null ? String(decodedUser.sub) : null,
        ].filter(Boolean)

        return userIdentifiers.includes(strOwnerId)
      }
      return false
    }

    return true
  }

  /**
   * Check if the user has a specific feature flag.
   * @param {string} flag - e.g. "lms", "lms-learning", "student"
   * @returns {boolean}
   */
  function hasFeatureFlag(flag) {
    if (isSuperAdmin) return true
    return featureFlags.includes(flag?.toLowerCase())
  }

  // Still waiting for permissions to resolve — treat as loading to prevent false Access Denied
  const isInitializing = hasToken && !isSuperAdmin && data === undefined && !isError

  return {
    isLoading: isLoading || isFetching || isInitializing,
    isError,
    permissions,
    featureFlags,
    isSuperAdmin,
    can,
    hasFeatureFlag,
  }
}

export default usePermissions
