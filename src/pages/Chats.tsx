"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Loader2,
  MessageCircle,
  Phone,
  Users,
  Clock,
  Send,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { getSessionChats, getAllSessions } from "../lib/api"
import type { ChatData, SessionData } from "../lib/types"
import { Link, useParams } from "react-router-dom"
import { useWhatsAppWebSocket } from '../hooks/useWhatsAppWebSocket';

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatData[]>([])
  const {sessionId} = useParams()
  const [selectedSession, setSelectedSession] = useState<string>(String(sessionId))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const handleMessage = useCallback((message: any) => {
    fetchChats(selectedSession)
  }, []);
  
  const handleQRCode = useCallback((qrData: any) => {
    console.log('QR Code received in Home component:', qrData);
    fetchChats(selectedSession)
  }, []);
  
  const handleConnect = useCallback(() => {
    console.log('WebSocket connected');
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('WebSocket disconnected');
  }, []);

  // Initialize WebSocket with memoized callbacks
  const whatsapp = useWhatsAppWebSocket({
    serverUrl: 'http://67.211.221.109:3002',
    autoConnect: true, // This will auto-connect
    onMessage: handleMessage,
    onQRCode: handleQRCode,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    enableNotifications: true
  });


  const fetchChats = async (sessionName: string) => {
    if (!sessionName) return

    setIsLoading(true)
    setError("")
    try {
      const response = await getSessionChats(sessionName)
      if (response.success) {
        setChats(response.data)
      } else {
        setError("Failed to fetch chats")
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedSession) {
      fetchChats(selectedSession)
    }
  }, [selectedSession])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace("@c.us", "")
    return `+${cleanNumber}`
  }

  const getChatTypeIcon = (chatType: string) => {
    return chatType === "individual" ? <Phone className="w-4 h-4" /> : <Users className="w-4 h-4" />
  }

  const getUnreadBadge = (unreadCount: number) => {
    if (unreadCount === 0) return null
    return (
      <Badge variant="destructive" className="ml-2">
        {unreadCount}
      </Badge>
    )
  }

  // Filter chats based on search term and filter type
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      searchTerm === "" ||
      chat.participantNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessageText?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      (chat.groupName && chat.groupName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterType === "all" ||
      (filterType === "individual" && chat.chatType === "individual") ||
      (filterType === "group" && chat.chatType === "group") ||
      (filterType === "unread" && chat.unreadCount > 0) ||
      (filterType === "active" && chat.isActive)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Chats</h1>
              <p className="text-gray-600">View and manage all WhatsApp conversations</p>
            </div>
            <Link to="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">

          {/* Chat Statistics */}
          {selectedSession && chats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total Chats</p>
                      <p className="text-2xl font-bold">{filteredChats.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Active Chats</p>
                      <p className="text-2xl font-bold">{filteredChats.filter((c) => c.isActive).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Unread</p>
                      <p className="text-2xl font-bold">{filteredChats.filter((c) => c.unreadCount > 0).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chats List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{selectedSession ? `Chats for ${selectedSession}` : "Select a Session"}</CardTitle>
                    <CardDescription>
                      {filteredChats.length > 0
                        ? `Showing ${filteredChats.length} of ${chats.length} chats`
                        : "No chats to display"}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedSession ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Please select a session to view chats</p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading chats...
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">{error}</div>
                  <Button onClick={() => fetchChats(selectedSession)} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No chats found</p>
                  <p className="text-sm">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Chats will appear here once conversations start"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChats.map((chat) => (
                      chat.chatId !== `status@broadcast` && (
                        <Link to={'/chats/' + sessionId + "/" + chat.chatId} key={chat.id}>
                            <div key={chat.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors mb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {getChatTypeIcon(chat.chatType)}
                                    <h3 className="font-semibold">
                                    {chat.chatType === "individual"
                                        ? chat.chatName || formatPhoneNumber(chat.participantNumber)
                                        : chat.groupName || chat.chatName}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                    {chat.chatType}
                                    </Badge>
                                    {getUnreadBadge(chat.unreadCount)}
                                </div>
    
                                <div className="bg-gray-50 rounded-md p-3 mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-500">Last message from {chat.lastMessageFrom}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{formatDate(chat.lastMessageTime)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 line-clamp-2">{chat.lastMessageText === "[PTT]" ? "Media File" : (chat.lastMessageText?.length > 60 ? chat.lastMessageText?.slice(0, 60) + " ..." : chat.lastMessageText) }</p>
                                </div>
    
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span className="font-medium">Total:</span>
                                    <span>{chat.totalMessages}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                    <Send className="w-3 h-3 text-blue-500" />
                                    <span className="font-medium">Sent:</span>
                                    <span>{chat.sentMessages}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3 text-green-500" />
                                    <span className="font-medium">Received:</span>
                                    <span>{chat.receivedMessages}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="font-medium">Created:</span>
                                    <span>{formatDate(chat.createdAt)}</span>
                                    </div>
                                </div>
                                </div>
    
                                <div className="ml-4 flex flex-col items-end gap-2">
                                <Badge
                                    variant={chat.isActive ? "default" : "secondary"}
                                    className={chat.isActive ? "bg-green-600" : ""}
                                >
                                    {chat.isActive ? "Active" : "Inactive"}
                                </Badge>
                                </div>
                            </div>
                            </div>
                        </Link>
                      )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
