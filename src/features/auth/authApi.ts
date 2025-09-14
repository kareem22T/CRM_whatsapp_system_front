import { BASE_URL1 } from "@/config"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Define the response type based on the API response structure
interface LoginResponse {
  success: boolean
  message: string
  timestamp: string
  data: {
    user: {
      id: number
      email: string
      role: string
      name: string
      isActive: boolean
    }
    token: string
  }
}

interface LoginRequest {
  email: string
  password: string
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL1 }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
})

export const { useLoginMutation } = authApi

