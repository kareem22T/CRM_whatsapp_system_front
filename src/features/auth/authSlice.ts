import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { safeParse } from "../../utils/helpers"

// Define the User type based on the API response
interface User {
  id: number
  email: string
  name: string
  role: string // 👈 add this
}

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: User | null
}

const initialState: AuthState = {
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  user: safeParse<User | null>(localStorage.getItem("user"), null),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string
        user: User
      }>,
    ) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user

      // Store in localStorage
      localStorage.setItem("token", action.payload.token)
      localStorage.setItem("user", JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

