import authAPI from "@/features/auth/authAPI";
import categoryAPI from "@/features/category/categoryAPI";
import { combineReducers } from "@reduxjs/toolkit";

const reducers = combineReducers({
    // placeholder: (state = {}) => state // TODO: Add your actual slices/reducers here
    [authAPI.reducerPath]: authAPI.reducer,
    [categoryAPI.reducerPath]: categoryAPI.reducer,
});

export default reducers;
