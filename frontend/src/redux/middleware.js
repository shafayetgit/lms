import api from "@/redux/api";

export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  })
    .concat(api.middleware);
