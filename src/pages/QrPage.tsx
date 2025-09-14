"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RefreshCw, QrCode } from "lucide-react"
import { getSessionQR } from "@/lib/api"
import type { QRResponse } from "@/lib/types"
import { useNavigate } from "react-router-dom"

export default function QRCodePage() {
  const [qrData, setQrData] = useState<QRResponse | null>(null)
  const [agentName, setAgentName] = useState("")
  const [sessionName, setSessionName] = useState("")
  const [countdown, setCountdown] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Get stored data from localStorage
    const storedAgentName = localStorage.getItem("agentName")
    const storedSessionName = localStorage.getItem("sessionName")

    if (!storedAgentName || !storedSessionName) {
      navigate("/")
      return
    }

    setAgentName(storedAgentName)
    setSessionName(storedSessionName)
  }, [navigate])

  const fetchQRCode = async () => {
    if (!sessionName) return

    try {
      setIsLoading(true)
      const response = await getSessionQR(sessionName)
      setQrData(response)
      setError("")
    } catch (err) {
      setError("Failed to fetch QR code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (sessionName) {
      fetchQRCode()
    }
  }, [sessionName])

  useEffect(() => {
    if (!sessionName) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQRCode()
          return 5
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionName])

  const handleBackToRegister = () => {
    localStorage.removeItem("agentName")
    localStorage.removeItem("sessionName")
    navigate("/")
  }

  const progressValue = ((5 - countdown) / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={handleBackToRegister} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <QrCode className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">WhatsApp QR Code</CardTitle>
            <CardDescription>Welcome, {agentName}! Scan this QR code with WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                Session: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{sessionName}</span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
                {error}
                <Button onClick={fetchQRCode} className="ml-2 bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            )}

            <div className="flex justify-center">
              {isLoading ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Loading QR Code...</p>
                  </div>
                </div>
              ) : qrData?.qr ? (
                <div className="text-center">
                  <img
                    src={qrData.qr || "/placeholder.svg"}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 border rounded-lg shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">Attempt #{qrData.attempts}</p>
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500">No QR code available</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Next refresh in:</span>
                <span className="font-mono">{countdown}s</span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-gray-500 text-center">QR code refreshes automatically every 5 seconds</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Open WhatsApp on your phone</li>
                <li>2. Go to Settings {">"} Linked Devices</li>
                <li>3. Tap "Link a Device"</li>
                <li>4. Scan the QR code above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
