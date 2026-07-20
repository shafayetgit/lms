import api from "@/redux/api";
import { combineReducers } from "@reduxjs/toolkit";
import appReducer from "@/features/app/appSlice";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Only persist the app slice (theme, breadcrumbs)
const appPersistConfig = {
  key: "app",
  storage,
  whitelist: ["mode", "breadcrumbLabels"],
};

const reducers = combineReducers({
  [api.reducerPath]: api.reducer,
  app: persistReducer(appPersistConfig, appReducer),
});

export default reducers;
