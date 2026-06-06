import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  mode: "dark",
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
    setTheme: (state, action) => {
      state.mode = action.payload
    },
  },
})

export const { toggleTheme, setTheme } = appSlice.actions
export default appSlice.reducer
