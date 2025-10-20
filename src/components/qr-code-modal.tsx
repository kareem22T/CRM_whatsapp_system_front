"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { RefreshCw, QrCode } from "lucide-react"
import { getSessionQR } from "../lib/api"
import type { QRResponse } from "../lib/types"

interface QRCodeModalProps {
  sessionName: string
  onClose: () => void
}

export function QRCodeModal({ sessionName, onClose }: QRCodeModalProps) {
  const [qrData, setQrData] = useState<QRResponse | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchQRCode = async () => {
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
    fetchQRCode()
  }, [sessionName])

  useEffect(() => {
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
  }, [])

  const progressValue = ((5 - countdown) / 5) * 100

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Live QR Code
          </DialogTitle>
          <DialogDescription>
            Session: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{sessionName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
              {error}
              <Button variant="outline" size="sm" onClick={fetchQRCode} className="ml-2 bg-transparent">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
