import { getCookie } from "@/utils/shared";
import { decodeTokenClient } from "@/utils/shared";

export const getCurrentUser = () => {
  const accessToken = getCookie("accessToken");

  if (!accessToken) return null;
  return decodeTokenClient(accessToken);
};

export const currentUser = getCurrentUser()