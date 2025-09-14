import React from "react"
import { BrowserRouter, Routes, Route } from "react-router"
import PrivateRoute from "./PrivateRoute"
import Login from "@/features/auth/Login"
import Home from "@/pages/Home"
import ChatsPage from "@/pages/Chats"
import ChatView from "@/pages/Chat"
import RootLayout from "@/layout/AppLayout"
import ProfilePage from "@/pages/Profile"
import UsersPage from "@/pages/users"
import ContactsPage from "@/pages/contacts"
import TemplatesPage from "@/pages/templates"
import CampaignsPage from "@/pages/campaigns/campaigns-page"

const AppRouter: React.FC = () => {
  console.log('AppRouter rendered'); // للتتبع
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Layout - Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chats/:sessionId" element={<ChatsPage />} />
            <Route path="/chats/:sessionId/:chatId" element={<ChatView />} />
          </Route>
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter