import api from "@/redux/api";
import { combineReducers } from "@reduxjs/toolkit";

const reducers = combineReducers({
    [api.reducerPath]: api.reducer,
});

export default reducers;
