export interface CreateSessionResponse {
  success: boolean
  message: string
  sessionName: string
}

export interface QRResponse {
  sessionName: string
  qr: string
  qrString: string
  attempts: number
}

export interface SessionData {
  id: number
  sessionName: string
  agentName: string
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
  activeDays: number
  totalChats: number
}

export interface SessionsResponse {
  success: boolean
  message: string
  timestamp: string
  data: SessionData[]
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
export interface ChatData {
  id?: number
  chatId: string
  chatName: string
  chatType: string
  participantNumber: string
  groupName: string | null
  lastMessageId: string
  lastMessageText: string
  lastMessageTime: string
  lastMessageFrom: string
  unreadCount: number
  isActive: boolean
  sessionName: string
  createdAt: string
  updatedAt: string
  totalMessages: number
  receivedMessages: number
  sentMessages: number
  lastReplyId?: string | null
  replyCount?: number
}

export interface ChatsResponse {
  success: boolean
  data: ChatData[]
  message: string
  timestamp: string
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface MessageData {
  id: number
  messageId: string
  fromNumber: string
  toNumber: string
  messageBody: string
  messageType: string
  isGroup: boolean
  groupId: string | null
  timestamp: string
  isFromMe: boolean
  messageStatus: string
  sessionName: string
  mediaUrl: string | null
  mediaFilename: string | null
  mediaMimetype: string | null
  mediaSize: string | null
  chatId: string
  senderName: string | null
  participantName: string | null
  participantPhone: string | null
  contactPushname: string | null
  createdAt: string
  updatedAt: string
  downloadUrl?: string
  viewUrl?: string
  isReply: boolean
  quotedMessageId: string | null
  quotedMessageBody: string | null
  quotedMessageFrom: string | null
  quotedMessageType: string | null
  quotedMessageTimestamp: string | null
}
export interface MessagesResponse {
  success: boolean
  message: string
  timestamp: string
  data: MessageData[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface SendMessageResponse {
  success: boolean
  message: string
  timestamp: string
  data: {
    success: boolean
    messageId: string
    to: string
    body: string
    hasMedia: boolean
    timestamp: string
  }
}

export interface Message {
  messageId: string;
  body?: string;
  message_body?: string;
  fromMe: boolean;
  from?: string;
  from_number?: string;
  to?: string;
  to_number?: string;
  timestamp?: string;
  created_at?: string;
  sender_name?: string;
  hasMedia?: boolean;
  type?: string;
  status?: 'sent' | 'delivered' | 'read' | 'played';
  message_status?: 'sent' | 'delivered' | 'read' | 'played';
}

export interface Session {
  sessionName: string;
  agentName: string;
  status: 'ready' | 'authenticated' | 'initializing' | 'auth_failure' | 'disconnected';
}

export interface Chat {
  chat_id: string;
  chat_name: string;
  chat_type: 'group' | 'individual';
  last_message_text?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface QRCodeData {
  sessionName: string;
  qr: string;
}

export interface Stats {
  activeSessions: number;
  messagesToday: number;
  connectedClients: number;
}

export interface WebSocketEvents {
  'new-message': (message: Message) => void;
  'message-status-update': (statusData: { messageId: string; status: string }) => void;
  'session-status-update': (sessionData: { sessionName: string; status: string }) => void;
  'qr-code': (qrData: QRCodeData) => void;
}

export interface WebSocketEmitEvents {
  'join-session': (sessionName: string) => void;
  'leave-session': (sessionName: string) => void;
  'join-chat': (chatId: string) => void;
  'leave-chat': (chatId: string) => void;
}

export interface NotificationOptions {
  title?: string;
  body?: string;
  icon?: string;
  onClick?: () => void;
}

// types.ts
export interface Message {
  messageId: string;
  body?: string;
  message_body?: string;
  fromMe: boolean;
  from?: string;
  from_number?: string;
  to?: string;
  to_number?: string;
  timestamp?: string;
  created_at?: string;
  sender_name?: string;
  hasMedia?: boolean;
  type?: string;
  status?: 'sent' | 'delivered' | 'read' | 'played';
  message_status?: 'sent' | 'delivered' | 'read' | 'played';
  quoted_message_from?: string;
  quoted_message_body?: string;

}

export interface Session {
  sessionName: string;
  agentName: string;
  status: 'ready' | 'authenticated' | 'initializing' | 'auth_failure' | 'disconnected';
}

export interface Chat {
  chat_id: string;
  chat_name: string;
  chat_type: 'group' | 'individual';
  last_message_text?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface QRCodeData {
  sessionName: string;
  qr: string;
}

export interface Stats {
  activeSessions: number;
  messagesToday: number;
  connectedClients: number;
}
export interface WebSocketEvents {
  'new-message': (message: Message) => void;
  'message-status-update': (statusData: { messageId: string; status: string }) => void;
  'session-status-update': (sessionData: { sessionName: string; status: string }) => void;
  'qr-code': (qrData: QRCodeData) => void;
}

export interface WebSocketEmitEvents {
  'join-session': (sessionName: string) => void;
  'leave-session': (sessionName: string) => void;
  'join-chat': (chatId: string) => void;
  'leave-chat': (chatId: string) => void;
}

export interface NotificationOptions {
  title?: string;
  body?: string;
  icon?: string;
  onClick?: () => void;
}
