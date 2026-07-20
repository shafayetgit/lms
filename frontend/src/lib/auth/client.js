import { getCookie } from "@/utils/shared";
import { decodeTokenClient } from "@/utils/shared";

export const getCurrentUser = () => {
  const accessToken = getCookie("accessToken");

  if (!accessToken) return null;
  const decoded = decodeTokenClient(accessToken);
  if (!decoded) return null;

  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < now) {
    return null;
  }
  return decoded;
};

export const getProfileUser = () => {
  if (typeof window === "undefined") return null;
  const userCookie = getCookie("user");
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie);
  } catch (e) {
    return null;
  }
};

export const currentUser = getCurrentUser()