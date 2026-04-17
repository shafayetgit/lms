import { decodeTokenServer } from "@/utils/shared";
import { cookies } from "next/headers";

export const getCurrentUser = (request = null) => {
  let accessToken;

  if (request) {
    accessToken = request.cookies.get("accessToken")?.value;
  } else {
    const cookieStore = cookies();
    accessToken = cookieStore.get("accessToken")?.value;
  }

  if (!accessToken) return null;
  return decodeTokenServer(accessToken);
};