import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import { authApi } from "../features/auth/authApi"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check globally for all APIs
      serializableCheck: false,
    })
      .concat(authApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch