export const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {},
  });
// .concat(baseApiSlice.middleware)
