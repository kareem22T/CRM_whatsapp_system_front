"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Loader2, Smartphone, Users, QrCode, Plus, RefreshCw, MessageCircle } from "lucide-react"
import { createSession, getAllSessions } from "../lib/api"
import type { SessionData } from "../lib/types"
import { QRCodeModal } from "../components/qr-code-modal"
import { Link } from "react-router-dom"
import { useWhatsAppWebSocket } from "../hooks/useWhatsAppWebSocket"
import { UserSelect } from "./user-select"
import { useAppSelector } from "@/app/hooks"

export default function Home() {
  const [agentName, setAgentName] = useState("")
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const token = useAppSelector((state) => state.auth.token)
  const role = useAppSelector((state) => state.auth.user?.role)

  // Memoize callbacks to prevent infinite re-renders
  const handleMessage = useCallback((message: any) => {
    console.log("Message received in Home component:", message)
    fetchSessions()
  }, [])

  const handleQRCode = useCallback((qrData: any) => {
    console.log("QR Code received in Home component:", qrData)
    setSelectedSession(null)
    fetchSessions()
  }, [])

  const handleConnect = useCallback(() => {
    console.log("WebSocket connected")
  }, [])

  const handleDisconnect = useCallback(() => {
    console.log("WebSocket disconnected")
  }, [])

  // Initialize WebSocket with memoized callbacks
  const whatsapp = useWhatsAppWebSocket({
    serverUrl: "http://67.211.221.109:3002",
    autoConnect: true, // This will auto-connect
    onMessage: handleMessage,
    onQRCode: handleQRCode,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    enableNotifications: true,
  })

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const response = await getAllSessions()
      if (response.success) {
        setSessions(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  // Only run once on mount
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName.trim()) {
      setError("Agent name is required")
      return
    }

    if (!selectedUserId) {
      setError("Please select a user")
      return
    }

    setIsCreating(true)
    setError("")
    setSuccess("")

    try {
      const response = await createSession(agentName, Number(selectedUserId), String(token))
      if (response.success) {
        setSuccess(`Session "${agentName}" created successfully! Session: ${response.sessionName}`)
        setAgentName("")
        setSelectedUserId("")
        // Refresh sessions list
        await fetchSessions()
      } else {
        setError("Failed to create agent session. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (connectionStatus: string) => {
    const isActive = connectionStatus === "authenticated" || connectionStatus === "ready"
    return isActive ? (
      <Badge variant="default" className="bg-green-600">
        {connectionStatus === "authenticated" ? "Authenticated" : "Ready"}
      </Badge>
    ) : connectionStatus === "initializing" ? (
      <Badge variant="secondary" className="bg-yellow-600">
        Initializing
      </Badge>
    ) : (
      <Badge variant="destructive">{connectionStatus === "auth_failure" ? "Auth Failed" : "Disconnected"}</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="sessions" className="space-y-6">
          {
            role === "admin" && (
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="add-agent" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Session
                </TabsTrigger>
              </TabsList>
            )
          }

          <TabsContent value="add-agent">
            <Card className="max-w-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Add New Session</CardTitle>
                    <CardDescription>Create a new WhatsApp session for a user</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAgent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Session Name</Label>
                    <Input
                      id="agentName"
                      type="text"
                      placeholder="Enter session name"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2 bg-white">
                    <Label htmlFor="userId">Select User</Label>
                    <UserSelect
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                      placeholder="Choose a user for this session..."
                    />
                  </div>

                  {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                  {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Session...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Session
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Agent Sessions</CardTitle>
                      <CardDescription>View and manage all WhatsApp agent sessions</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" onClick={fetchSessions} disabled={isLoadingSessions}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingSessions ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading sessions...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No agent sessions found</p>
                    <p className="text-sm">Create your first agent to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionName}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{session.sessionName}</h3>
                              <span className="text-sm text-gray-500">({session.agentName})</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Created:</span>
                                <br />
                                {formatDate(session.createdAt)}
                              </div>
                              <div>
                                <span className="font-medium">Last Connected:</span>
                                <br />
                                {formatDate(session.lastConnected)}
                              </div>
                              <div>
                                <span className="font-medium">Total Messages:</span>
                                <br />
                                {session.totalMessages}
                              </div>
                              <div>
                                <span className="font-medium">Total Chats:</span>
                                <br />
                                {session.totalChats}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                              <div>
                                <span className="font-medium">Sent:</span> {session.sentMessages}
                              </div>
                              <div>
                                <span className="font-medium">Received:</span> {session.receivedMessages}
                              </div>
                              <div>
                                <span className="font-medium">Media:</span> {session.mediaMessages}
                              </div>
                              <div>
                                <span className="font-medium">Active Days:</span> {session.activeDays}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Link to={"/chats/" + session.sessionName}>
                              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                                <MessageCircle className="w-4 h-4" />
                                View All Chats
                              </Button>
                            </Link>
                            {
                              role === "admin" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSession(session.sessionName)}
                                  className="flex items-center gap-2"
                                >
                                  <QrCode className="w-4 h-4" />
                                  Show Live QR
                                </Button>
                              )
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedSession && <QRCodeModal sessionName={selectedSession} onClose={() => setSelectedSession(null)} />}
      </div>
    </div>
  )
}
