import { configureStore } from "@reduxjs/toolkit"
import { persistStore } from "redux-persist"
import { middleware } from "./middleware"
import reducers from "./reducers"

export const makeStore = () => {
  const store = configureStore({
    reducer: reducers,
    middleware,
  })
  const persistor = persistStore(store)
  return { store, persistor }
}
