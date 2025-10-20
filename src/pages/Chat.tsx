"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Send,
  Phone,
  Users,
  Download,
  Eye,
  Paperclip,
  ImageIcon,
  FileText,
  Mic,
  X,
  RefreshCw,
  Reply,
} from "lucide-react"
import { getChatMessages, sendMessage, sendMediaMessage } from "@/lib/api"
import type { MessageData } from "@/lib/types"
import { useWhatsAppWebSocket } from "@/hooks/useWhatsAppWebSocket"
import { useAppSelector } from "@/app/hooks"
import { useParams } from "react-router-dom"

export default function ChatView() {
  const params = useParams()
  const sessionId = (params?.sessionId as string) || ""
  const chatId = (params?.chatId as string) || ""

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [totalMessages, setTotalMessages] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const loadingPageRef = useRef<number | null>(null)

  const token = useAppSelector((state) => state?.auth?.token) || ""

  const MESSAGES_PER_PAGE = 50

  const handleMessage = useCallback((message: any) => {
    fetchNewMessages()
  }, [])

  const handleQRCode = useCallback((qrData: any) => {
    console.log("QR Code received:", qrData)
    fetchNewMessages()
  }, [])

  const handleConnect = useCallback(() => {
    console.log("WebSocket connected")
  }, [])

  const handleDisconnect = useCallback(() => {
    console.log("WebSocket disconnected")
  }, [])

  const whatsapp = useWhatsAppWebSocket({
    serverUrl: "http://67.211.221.109:3002",
    autoConnect: true,
    onMessage: handleMessage,
    onQRCode: handleQRCode,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    enableNotifications: true,
  })

  const fetchMessages = async (page = 1, append = false) => {
    if (page === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setError("")

    try {
      const response = await getChatMessages(sessionId, chatId, page, MESSAGES_PER_PAGE, String(token))
      if (response.success) {
        const newMessages = response.data
        const pagination = response.pagination

        if (append) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id))
            const uniqueNewMessages = newMessages.filter((msg) => !existingIds.has(msg.id))
            return [...uniqueNewMessages.reverse(), ...prev]
          })
        } else {
          setMessages(newMessages.reverse())
        }

        setHasMoreMessages(pagination?.hasNextPage || false)
        setTotalMessages(pagination?.totalItems || 0)
        setCurrentPage(page)
      } else {
        setError("Failed to fetch messages")
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const fetchNewMessages = async () => {
    try {
      const response = await getChatMessages(sessionId, chatId, 1, MESSAGES_PER_PAGE, String(token))
      if (response.success) {
        const latestMessages = response.data.reverse()

        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id))
          const newMessages = latestMessages.filter((msg) => !existingIds.has(msg.id))
          return [...prev, ...newMessages]
        })
      }
    } catch (err) {
      console.error("Failed to fetch new messages:", err)
    }
  }

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return

    const nextPage = currentPage + 1

    if (loadingPageRef.current === nextPage) return

    loadingPageRef.current = nextPage

    try {
      await fetchMessages(nextPage, true)
    } finally {
      loadingPageRef.current = null
    }
  }, [currentPage, hasMoreMessages, isLoadingMore, sessionId, chatId])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop <= 100 && hasMoreMessages && !isLoadingMore && loadingPageRef.current === null) {
      const previousScrollHeight = container.scrollHeight
      const previousScrollTop = container.scrollTop

      loadMoreMessages().then(() => {
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight
            const scrollDifference = newScrollHeight - previousScrollHeight
            container.scrollTop = previousScrollTop + scrollDifference
          }
        })
      })
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    let timeoutId: NodeJS.Timeout

    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 150)
    }

    container.addEventListener("scroll", debouncedHandleScroll)
    return () => {
      container.removeEventListener("scroll", debouncedHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  useEffect(() => {
    if (sessionId && chatId) {
      setIsInitialLoad(true)
      setCurrentPage(1)
      setHasMoreMessages(true)
      setMessages([])
      fetchMessages(1, false).then(() => {
        setIsInitialLoad(false)
      })
    }
  }, [sessionId, chatId])

  useEffect(() => {
    if (isInitialLoad || (!isLoadingMore && messages.length > 0)) {
      scrollToBottom()
    }
  }, [messages, isInitialLoad, isLoadingMore])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || isSending) return

    setIsSending(true)
    setError("")

    try {
      let response
      if (selectedFile) {
        response = await sendMediaMessage(sessionId, chatId, selectedFile, newMessage)
      } else {
        response = await sendMessage(sessionId, chatId, newMessage)
      }

      if (response.success) {
        setNewMessage("")
        setSelectedFile(null)
        await fetchNewMessages()
      } else {
        setError("Failed to send message")
      }
    } catch (err) {
      console.error("Failed to send message:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace("@c.us", "").replace("@g.us", "")
    return `+${cleanNumber}`
  }

  const getMessageTypeIcon = (message: MessageData) => {
    if (message.mediaFilename) {
      if (message.mediaMimetype?.includes("image")) return <ImageIcon className="w-4 h-4" />
      if (message.mediaMimetype?.includes("audio")) return <Mic className="w-4 h-4" />
      return <FileText className="w-4 h-4" />
    }
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const getSenderDisplayName = (message: MessageData) => {
    if (message.senderName) {
      return message.senderName
    }
    if (message.fromNumber) {
      return formatPhoneNumber(message.fromNumber)
    }
    return "Unknown"
  }

  const getSenderColor = (senderName: string) => {
    const colors = [
      "text-red-600",
      "text-blue-600",
      "text-green-600",
      "text-purple-600",
      "text-orange-600",
      "text-pink-600",
      "text-indigo-600",
      "text-teal-600",
    ]

    let hash = 0
    for (let i = 0; i < senderName.length; i++) {
      hash = senderName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const getQuotedSenderName = (quotedFrom: string) => {
    if (!quotedFrom) return "Unknown"

    if (quotedFrom.includes(sessionId) || quotedFrom === "me") {
      return "You"
    }

    const quotedMessage = messages.find((msg) => msg.fromNumber === quotedFrom)
    if (quotedMessage?.senderName) {
      return quotedMessage.senderName
    }

    return formatPhoneNumber(quotedFrom)
  }

  const chatDisplayName = chatId.includes("@g.us") ? `Group Chat` : formatPhoneNumber(chatId)
  const isGroupChat = chatId.includes("@g.us")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 max-w-5xl">
        {/* Enhanced Header */}
        <div className="mb-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isGroupChat
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-green-500 to-green-600"
                      }`}
                    >
                      {isGroupChat ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <Phone className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{chatDisplayName}</h1>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span>Session: {sessionId}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-green-600 font-medium">Online</span>
                      {totalMessages > 0 && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="text-gray-500">{totalMessages} messages</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage(1)
                    setHasMoreMessages(true)
                    fetchMessages(1, false)
                  }}
                  disabled={isLoading}
                  className="hover:bg-blue-50 border-blue-200 bg-transparent"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Chat Container */}
        <Card className="h-[75vh] flex flex-col border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Error Display */}
          {error && (
            <div className="mx-4 mt-4">
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
            style={{ scrollBehavior: "smooth" }}
          >
            {/* Load More Indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading older messages...</span>
                </div>
              </div>
            )}

            {/* No More Messages Indicator */}
            {!hasMoreMessages && messages.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                  Beginning of conversation
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-600 font-medium">Loading messages...</p>
                  <p className="text-sm text-gray-400">Please wait</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                <p className="text-gray-500">Start the conversation by sending a message below</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const showDateSeparator =
                    index === 0 ||
                    new Date(message.timestamp).toDateString() !==
                      new Date(messages[index - 1].timestamp).toDateString()

                  return (
                    <div key={message.id}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-6">
                          <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                            {new Date(message.timestamp).toLocaleDateString([], {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      )}

                      <div className={`flex ${message.isFromMe ? "justify-end" : "justify-start"} mb-2`}>
                        <div className={`max-w-[75%] group ${message.isFromMe ? "ml-12" : "mr-12"}`}>
                          {/* Sender Name for Group Chats */}
                          {isGroupChat && !message.isFromMe && (
                            <div className="mb-1 px-1">
                              <span
                                className={`text-xs font-semibold ${getSenderColor(getSenderDisplayName(message))}`}
                              >
                                {getSenderDisplayName(message)}
                              </span>
                            </div>
                          )}

                          {/* Reply Indicator */}
                          {message.isReply && message.quotedMessageBody && (
                            <div className={`mb-2 px-1 ${message.isFromMe ? "ml-4" : "mr-4"}`}>
                              <div
                                className={`border-l-4 pl-3 py-2 rounded-r-lg ${
                                  message.isFromMe ? "border-blue-300 bg-blue-50/50" : "border-gray-300 bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Reply className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs font-medium text-gray-600">
                                    Replying to {getQuotedSenderName(message.quotedMessageFrom || "")}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2 italic">
                                  {message.quotedMessageBody.length > 100
                                    ? `${message.quotedMessageBody.substring(0, 100)}...`
                                    : message.quotedMessageBody}
                                </p>
                              </div>
                            </div>
                          )}

                          <div
                            className={`rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                              message.isFromMe
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                                : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                            }`}
                          >
                            {/* Media Content */}
                            {message.mediaFilename && (
                              <div className={`mb-3 p-3 rounded-lg ${message.isFromMe ? "bg-white/10" : "bg-gray-50"}`}>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {getMessageTypeIcon(message)}
                                    <span className="text-sm font-medium truncate">{message.mediaFilename}</span>
                                  </div>
                                  {message.downloadUrl && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className={`h-8 w-8 p-0 ${
                                          message.isFromMe ? "hover:bg-white/20 text-white" : "hover:bg-gray-200"
                                        }`}
                                        onClick={() =>
                                          window.open(`http://67.211.221.109:3001${message.downloadUrl}`, "_blank")
                                        }
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                      {message.viewUrl && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-8 w-8 p-0 ${
                                            message.isFromMe ? "hover:bg-white/20 text-white" : "hover:bg-gray-200"
                                          }`}
                                          onClick={() =>
                                            window.open(`http://67.211.221.109:3001${message.viewUrl}`, "_blank")
                                          }
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Message Text */}
                            {message.messageBody && message.messageBody !== "[PTT]" && (
                              <p className="whitespace-pre-wrap leading-relaxed">{message.messageBody}</p>
                            )}

                            {message.messageBody === "[PTT]" && (
                              <div className="flex items-center gap-2">
                                <Mic className="w-4 h-4" />
                                <span className="text-sm font-medium">Voice message</span>
                              </div>
                            )}
                          </div>

                          {/* Message Metadata */}
                          <div
                            className={`flex items-center gap-2 mt-1 px-1 ${
                              message.isFromMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                            {message.isFromMe && (
                              <Badge
                                variant="secondary"
                                className={`text-xs h-5 ${
                                  message.messageStatus === "read"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                {message.messageStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Enhanced Message Input */}
          <div className="border-t bg-white/50 backdrop-blur-sm p-4">
            <form onSubmit={handleSendMessage} className="space-y-3">
              {selectedFile && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-900 truncate">{selectedFile.name}</span>
                    <span className="text-xs text-blue-600 flex-shrink-0">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[48px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="h-12 w-12 p-0 border-gray-300 hover:bg-gray-50"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSending || (!newMessage.trim() && !selectedFile)}
                    size="sm"
                    className="h-12 w-12 p-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
