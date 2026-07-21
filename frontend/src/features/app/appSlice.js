import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  mode: "dark",
  breadcrumbLabels: {},
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleTheme: state => {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
    setTheme: (state, action) => {
      state.mode = action.payload
    },
    // Store custom breadcrumb labels keyed by route path or identifier
    setBreadcrumbLabel: (state, action) => {
      const { key, label } = action.payload || {}
      if (key && label) {
        state.breadcrumbLabels[key] = label
      }
    },
  },
})

export const { toggleTheme, setTheme, setBreadcrumbLabel } = appSlice.actions
export default appSlice.reducer
