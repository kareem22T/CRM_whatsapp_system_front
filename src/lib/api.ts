import type {
  CreateSessionResponse,
  QRResponse,
  SessionsResponse,
  ChatsResponse,
  MessagesResponse,
  SendMessageResponse,
} from "./types"

const API_BASE_URL = "http://67.211.221.109:3002"
const SESSIONS_API_URL = "http://67.211.221.109:3001"

export async function createSession(agentName: string, selectedUserId: number, token: string): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/add-session?agentName=${encodeURIComponent(agentName)}&userId=${selectedUserId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getSessionQR(sessionName: string): Promise<QRResponse> {
  const response = await fetch(`${API_BASE_URL}/qr/${sessionName}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getAllSessions(): Promise<SessionsResponse> {
  const response = await fetch(`${SESSIONS_API_URL}/sessions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getSessionChats(sessionName: string): Promise<ChatsResponse> {
  const response = await fetch(`${SESSIONS_API_URL}/chats/${sessionName}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionName}`
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getChatMessages(
  sessionName: string,
  chatId: string,
  page = 1,
  limit = 50,
  token: string,
): Promise<MessagesResponse> {
  const response = await fetch(
    `${SESSIONS_API_URL}/chats/${sessionName}/${chatId}/messages?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    },
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function sendMessage(
  sessionName: string,
  phoneNumber: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/send-message/${sessionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber,
      message,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function sendMediaMessage(
  sessionName: string,
  phoneNumber: string,
  media: File,
  message?: string,
): Promise<SendMessageResponse> {
  const formData = new FormData()
  formData.append("phoneNumber", phoneNumber)
  formData.append("media", media)
  if (message) {
    formData.append("message", message)
  }

  const response = await fetch(`${API_BASE_URL}/send-media/${sessionName}`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
