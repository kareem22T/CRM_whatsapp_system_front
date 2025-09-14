export interface Campaign {
  id: number
  name: string
  description: string
  minIntervalMinutes: number
  maxIntervalMinutes: number
  lastSent: string | null
  createdAt: string
  updatedAt: string
  sessionId: number
  groupId?: number
  status: "inactive" | "active" | "running" | "paused" | "completed" | "failed"
  isStarted?: boolean
  totalContacts: number
  messagesSent: number
  messagesFailed: number
  messagesPending: number
  progressPercentage: number
  nextSendAt: string | null
  startedAt: string | null
  completedAt: string | null
  pausedAt: string | null
  estimatedCompletionAt: string | null
  session?: {
    id: number
    sessionName: string
    agentName: string
    isActive: boolean
    lastConnected?: string
    connectionStatus?: string
  }
  contactGroup?: {
    id: number
    name: string
    description: string | null
    color: string | null
    isActive: boolean
  }
  contacts?: Array<{
    id: number
    name: string
    email: string
    phone: string
  }>
  templates?: Array<{
    id: number
    name: string
    message: string
  }>
}

export interface Job {
  id: number
  campaignId: number
  contactId: number
  templateId: number
  contactPhone: string
  templateMessage: string
  sessionName: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  queueJobId: string
  scheduledAt: string
  processingStartedAt: string | null
  processedAt: string | null
  delayMinutes: number
  whatsappMessageId: string | null
  errorMessage: string | null
  retryCount: number
  maxRetries: number
  isCompleted: boolean
  isFailed: boolean
  isPending: boolean
  isProcessing: boolean
  canRetry: boolean
}

export interface JobStats {
  totalJobs: number
  statusBreakdown: Array<{
    status: string
    count: number
    avgDelay?: number
  }>
  nextScheduledJob?: {
    jobId: number
    scheduledAt: string
    contactPhone: string
    delayMinutes: number
  }
}

export interface CampaignProgress {
  campaignId: number
  campaignName: string
  status: string
  totalContacts: number
  messagesSent: number
  messagesFailed: number
  messagesPending: number
  progressPercentage: number
  successRate: number
  nextSendAt: string | null
  startedAt: string | null
  completedAt: string | null
  estimatedCompletionAt: string | null
  remainingContacts: number
  lastSent: string | null
  isCompleted: boolean
  isActive: boolean
}
