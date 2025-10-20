"use client"

import { useState } from "react"
import {
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  IdentificationIcon,
  ChatBubbleBottomCenterIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline"
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { logout } from "@/features/auth/authSlice"

const navigationItems = [
  { name: "Sessions", href: "/", icon: ComputerDesktopIcon },
  { name: "Campaigns", href: "/campaigns", icon: MegaphoneIcon },
  { name: "Contacts", href: "/contacts", icon: IdentificationIcon },
  { name: "templates", href: "/templates", icon: ChatBubbleBottomCenterIcon },
  { name: "Users", href: "/users", icon: UsersIcon },
]

export default function Header() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const dispatch = useAppDispatch()

    const {user} = useAppSelector((state) => state.auth)

    const role = useAppSelector((state) => state.auth.user?.role)

    const filteredNavigation =
    role === "agent"
      ? navigationItems.filter((item) => item.name === "xx")
      : navigationItems
    const handleLogout = () => {
        dispatch(logout());
    }
  return (
    <header className="bg-gray-900 shadow-lg relative z-10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-black opacity-90"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-100">Whatsapp System</h1>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            {filteredNavigation.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-100 hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                >
                  <IconComponent className="h-5 w-5 text-gray-100" />
                  <span className="text-gray-100">{item.name}</span>
                </a>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-100 hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
            >
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block text-gray-100">{user?.name}</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-100" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                <a
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 transition-colors duration-200"
                >
                  <UserIcon className="h-4 w-4 text-gray-100" />
                  <span className="text-gray-100">Profile</span>
                </a>
                <button onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 w-full text-sm text-gray-100 hover:bg-gray-700 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-100" />
                  <span className="text-gray-100">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-2 rounded-md text-gray-100 hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
            >
              <svg className="h-6 w-6 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isUserMenuOpen && (
          <div className="md:hidden pb-4 bg-gray-800 bg-opacity-95 rounded-b-lg">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-100 hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                  >
                    <IconComponent className="h-5 w-5 text-gray-100" />
                    <span className="text-gray-100">{item.name}</span>
                  </a>
                )
              })}
              <hr className="border-gray-600 my-2 mx-3" />
              <a
                href="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-100 hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
              >
                <UserIcon className="h-5 w-5 text-gray-100" />
                <span className="text-gray-100">Profile</span>
              </a>
              <button onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-100 hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-100" />
                <span className="text-gray-100">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
