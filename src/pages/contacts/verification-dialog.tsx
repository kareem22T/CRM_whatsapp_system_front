"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"

interface Session {
  id: number
  sessionName: string
  agentName: string
  isActive: boolean
  lastConnected: string
  connectionStatus: string
  createdAt: string
  updatedAt: string
  userId: number
  totalMessages: number
  sentMessages: number
  receivedMessages: number
  mediaMessages: number
  individualChats: number
  groupChats: number
  firstMessageTime: string
  lastMessageTime: string
  activeDays: number
  totalChats: number
}

interface VerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "group" | "contact"
  targetId: number
  targetName: string
  onVerificationStarted: () => void
}

export function VerificationDialog({
  open,
  onOpenChange,
  type,
  targetId,
  targetName,
  onVerificationStarted,
}: VerificationDialogProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [minDelay, setMinDelay] = useState(5)
  const [maxDelay, setMaxDelay] = useState(15)
  const [loading, setLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(true)

  // Fetch available sessions
  useEffect(() => {
    if (open) {
      fetchSessions()
    }
  }, [open])

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true)
      // Fetch sessions from your backend
      // This assumes you have an endpoint to get available WhatsApp sessions
      const response = await fetch("http://67.211.221.109:3001/sessions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data.data || [])
        if (data.data && data.data.length > 0) {
          setSelectedSession(data.data[0].sessionName)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch available sessions",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleStartVerification = async () => {
    if (!selectedSession) {
      toast({
        title: "Error",
        description: "Please select a session",
        variant: "destructive",
      })
      return
    }

    if (minDelay >= maxDelay) {
      toast({
        title: "Error",
        description: "Minimum delay must be less than maximum delay",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const endpoint =
        type === "group"
          ? `http://67.211.221.109:3002/verification/group/${targetId}/start`
          : `http://67.211.221.109:3002/verification/contact/${targetId}/start`

      const payload =
        type === "group"
          ? {
              sessionName: selectedSession,
              minDelay,
              maxDelay,
            }
          : {
              sessionName: selectedSession,
              delaySeconds: minDelay,
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Verification started for ${type === "group" ? "group" : "contact"}: ${targetName}`,
        })
        onVerificationStarted()
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to start verification",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start verification",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start WhatsApp Verification</DialogTitle>
          <DialogDescription>
            Verify WhatsApp contacts for {type === "group" ? "group" : "contact"}: <strong>{targetName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will check which contacts have WhatsApp accounts. The process may take several minutes depending on
              the number of contacts.
            </AlertDescription>
          </Alert>

          {/* Session Selection */}
          <div className="space-y-3">
            <Label htmlFor="session">WhatsApp Session</Label>
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading sessions...</span>
              </div>
            ) : sessions.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No WhatsApp sessions available. Please set up a session first.</AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger id="session">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.sessionName}>
                      {session.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Delay Configuration */}
          {type === "group" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Delay Settings</CardTitle>
                <CardDescription>Configure delays between verification checks to avoid rate limiting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Min Delay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="min-delay">Minimum Delay</Label>
                    <span className="text-sm font-medium">{minDelay}s</span>
                  </div>
                  <Slider
                    id="min-delay"
                    min={1}
                    max={30}
                    step={1}
                    value={[minDelay]}
                    onValueChange={(value) => {
                      setMinDelay(value[0])
                      if (value[0] >= maxDelay) {
                        setMaxDelay(value[0] + 5)
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 5-10 seconds</p>
                </div>

                {/* Max Delay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="max-delay">Maximum Delay</Label>
                    <span className="text-sm font-medium">{maxDelay}s</span>
                  </div>
                  <Slider
                    id="max-delay"
                    min={minDelay + 1}
                    max={60}
                    step={1}
                    value={[maxDelay]}
                    onValueChange={(value) => setMaxDelay(value[0])}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 10-20 seconds</p>
                </div>

                {/* Info */}
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <p className="font-medium">Estimated Duration:</p>
                  <p className="text-muted-foreground">
                    With {minDelay}-{maxDelay}s delays, expect ~{Math.round(60 / ((minDelay + maxDelay) / 2))} contacts
                    per minute
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* For single contact, show fixed delay */}
          {type === "contact" && (
            <div className="space-y-2">
              <Label htmlFor="delay">Delay (seconds)</Label>
              <Slider
                id="delay"
                min={0}
                max={30}
                step={1}
                value={[minDelay]}
                onValueChange={(value) => setMinDelay(value[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Delay before checking this contact (0 = immediate)</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleStartVerification} disabled={loading || sessions.length === 0}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              "Start Verification"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
