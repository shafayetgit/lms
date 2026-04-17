import authAPI from "@/features/auth/authAPI";
import categoryAPI from "@/features/category/categoryAPI";

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  })
    .concat(authAPI.middleware)
    .concat(categoryAPI.middleware);
