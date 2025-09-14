import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { safeParse } from "../../utils/helpers"
import { User } from "../../types/auth"

interface Branch {
  id: string
  name: string
  active?: boolean
}

interface BranchState {
  currentBranch: Branch | null
  userBranches: Branch[]
  hasBranchSelected: boolean
}

// Helper function to get user-specific branch from localStorage
const getUserBranch = (userId: string): Branch | null => {
  try {
    const storedBranch = localStorage.getItem(`branch:${userId}`)
    return storedBranch ? safeParse<Branch | null>(storedBranch, null) : null
  } catch (error) {
    console.error("Error parsing stored branch:", error)
    return null
  }
}

// Get initial state based on current user ID
const getInitialState = (): BranchState => {
  // Try to get user ID from localStorage (set during login)
  const user = localStorage.getItem("user") ? safeParse<User | null>(localStorage.getItem("user"), null) : null
  const userId = user?.id || ""

  // Get branch for this specific user
  const userBranch = getUserBranch(String(userId))

  return {
    currentBranch: userBranch,
    userBranches: [],
    hasBranchSelected: !!userBranch,
  }
}

const branchSlice = createSlice({
  name: "branch",
  initialState: getInitialState(),
  reducers: {
    setCurrentBranch: (state, action: PayloadAction<{ branch: Branch; userId: string }>) => {
      const { branch, userId } = action.payload
      state.currentBranch = branch
      state.hasBranchSelected = true

      // Store branch with user ID as part of the key
      if (userId) {
        localStorage.setItem(`branch:${userId}`, JSON.stringify(branch))
      }
    },
    setUserBranches: (state, action: PayloadAction<Branch[]>) => {
      state.userBranches = action.payload
    },
    clearBranchSelection: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      state.currentBranch = null
      state.hasBranchSelected = false

      // Remove user-specific branch from localStorage
      if (userId) {
        localStorage.removeItem(`branch:${userId}`)
      }
    },
    // Called when a user logs out
    resetBranchState: (state) => {
      state.currentBranch = null
      state.hasBranchSelected = false
      state.userBranches = []
      // Note: We don't clear localStorage here as that's handled by the logout action
    },
  },
})

export const { setCurrentBranch, setUserBranches, clearBranchSelection, resetBranchState } = branchSlice.actions
export default branchSlice.reducer
