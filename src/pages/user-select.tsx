"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAppSelector } from "@/app/hooks"

interface UserSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function UserSelect({ value, onValueChange, placeholder = "Select user..." }: UserSelectProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const token = useAppSelector((state) => state.auth.token)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchUsers = async (searchTerm = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        search: searchTerm,
      })

      const response = await fetch(`http://67.211.221.109:3001/users?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }
    const handleUserSelect = (userId: string) => {
    onValueChange(userId === value ? "" : userId)
    setOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    fetchUsers(value)
  }


  useEffect(() => {
    fetchUsers()
  }, [])

  const selectedUser = users.find((user) => user.id === value)

  return (
    <div className="bg-white relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-md bg-transparent hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-expanded={open}
        role="combobox"
      >
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{selectedUser.name}</span>
            <span className="text-gray-500">({selectedUser.email})</span>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-0">
            <div className="flex items-center border-b border-gray-200 px-3">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={handleSearchChange}
                className="w-full py-2 text-sm bg-transparent outline-none placeholder:text-gray-500"
              />
            </div>

            <div className="max-h-60 overflow-auto">
              {users.length === 0 && (
                <div className="py-6 text-center text-sm text-gray-500">
                  {loading ? "Loading users..." : "No users found."}
                </div>
              )}

              <div className="p-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user.id)}
                    className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === user.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
