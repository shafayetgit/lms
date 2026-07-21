import api from "@/redux/api"

export const middleware = getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: {
      // Ignore redux-persist action types that carry non-serializable values
      ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
    },
  }).concat(api.middleware)
