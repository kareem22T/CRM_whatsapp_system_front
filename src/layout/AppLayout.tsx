import React, { Suspense } from "react"
import Header from "./AppHeader"
import { Outlet } from "react-router"

export default function RootLayout() {
  console.log('RootLayout rendered'); // للتتبع
  
  return (
    <div className="app-wrapper">
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}