import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { 
  Message, 
  Session, 
  Chat, 
  QRCodeData, 
  Stats, 
  WebSocketEvents, 
  WebSocketEmitEvents,
  NotificationOptions 
} from '../lib/types';

interface UseWhatsAppWebSocketConfig {
  serverUrl?: string;
  autoConnect?: boolean;
  onMessage?: (message: Message) => void;
  onMessageStatusUpdate?: (statusData: { messageId: string; status: string }) => void;
  onSessionStatusUpdate?: (sessionData: { sessionName: string; status: string }) => void;
  onQRCode?: (qrData: QRCodeData) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enableNotifications?: boolean;
  notificationConfig?: {
    requestPermission?: boolean;
    customNotification?: (data: any, options: NotificationOptions) => void;
  };
}

interface UseWhatsAppWebSocketReturn {
  socket: Socket<WebSocketEvents, WebSocketEmitEvents> | null;
  isConnected: boolean;
  messages: Message[];
  sessions: Session[];
  chats: Chat[];
  qrCodes: Record<string, QRCodeData>;
  stats: Stats;
  newMessageCount: number;
  connect: () => void;
  disconnect: () => void;
  joinSession: (sessionName: string) => void;
  leaveSession: (sessionName: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  clearNewMessageCount: () => void;
  fetchSessions: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchChats: (sessionName: string) => Promise<void>;
  fetchChatMessages: (sessionName: string, chatId: string) => Promise<void>;
  showNotification: (message: string, options?: NotificationOptions) => void;
}

export const useWhatsAppWebSocket = (config: UseWhatsAppWebSocketConfig = {}): UseWhatsAppWebSocketReturn => {
  const {
    serverUrl = 'http://67.211.221.109:3002',
    autoConnect = true,
    onMessage,
    onMessageStatusUpdate,
    onSessionStatusUpdate,
    onQRCode,
    onConnect,
    onDisconnect,
    enableNotifications = true,
    notificationConfig = {}
  } = config;

  const [socket, setSocket] = useState<Socket<WebSocketEvents, WebSocketEmitEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, QRCodeData>>({});
  const [stats, setStats] = useState<Stats>({
    activeSessions: 0,
    messagesToday: 0,
    connectedClients: 0
  });
  const [newMessageCount, setNewMessageCount] = useState(0);

  const socketRef = useRef<Socket<WebSocketEvents, WebSocketEmitEvents> | null>(null);
  const connectionAttemptRef = useRef(false);

  // Memoize callbacks to prevent infinite re-renders
  const onMessageCallback = useCallback(onMessage || (() => {}), [onMessage]);
  const onMessageStatusUpdateCallback = useCallback(onMessageStatusUpdate || (() => {}), [onMessageStatusUpdate]);
  const onSessionStatusUpdateCallback = useCallback(onSessionStatusUpdate || (() => {}), [onSessionStatusUpdate]);
  const onQRCodeCallback = useCallback(onQRCode || (() => {}), [onQRCode]);
  const onConnectCallback = useCallback(onConnect || (() => {}), [onConnect]);
  const onDisconnectCallback = useCallback(onDisconnect || (() => {}), [onDisconnect]);

  const showNotification = useCallback((message: string, options: NotificationOptions = {}) => {
    if (!enableNotifications) return;

    if (notificationConfig.customNotification) {
      notificationConfig.customNotification(message, options);
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(options.title || 'WhatsApp Notification', {
        body: options.body || message,
        icon: options.icon || '/whatsapp-icon.png'
      });

      if (options.onClick) {
        notification.onclick = options.onClick;
      }
    }
  }, [enableNotifications, notificationConfig]);

  const setupSocketListeners = useCallback((newSocket: Socket<WebSocketEvents, WebSocketEmitEvents>) => {
    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      setIsConnected(true);
      onConnectCallback();
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      setIsConnected(false);
      onDisconnectCallback();
    });

    newSocket.on('new-message', (messageData: Message) => {
      console.log('📱 New message received:', messageData);
      
      setMessages(prev => {
        const exists = prev.find(msg => msg.messageId === messageData.messageId);
        if (exists) return prev;
        
        return [messageData, ...prev].slice(0, 100);
      });
      
      setNewMessageCount(prev => prev + 1);
      
      onMessageCallback(messageData);
      
      showNotification(`New ${messageData.fromMe ? 'outgoing' : 'incoming'} message`, {
        title: 'WhatsApp Message',
        body: (messageData.body || messageData.message_body || '[Media]').substring(0, 50)
      });
    });

    newSocket.on('message-status-update', (statusData) => {
      console.log('📋 Message status update:', statusData);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.messageId === statusData.messageId 
            ? { ...msg, status: statusData.status as any }
            : msg
        )
      );
      
      onMessageStatusUpdateCallback(statusData);
    });

    newSocket.on('session-status-update', (sessionData) => {
      console.log('🔄 Session status update:', sessionData);
      
      setSessions(prev => 
        prev.map(session => 
          session.sessionName === sessionData.sessionName
            ? { ...session, status: sessionData.status as any }
            : session
        )
      );
      
      onSessionStatusUpdateCallback(sessionData);
    });

    newSocket.on('qr-code', (qrData: QRCodeData) => {
      console.log('📱 QR Code received:', qrData.sessionName);
      
      setQrCodes(prev => ({
        ...prev,
        [qrData.sessionName]: qrData
      }));
      
      onQRCodeCallback(qrData);
    });
  }, [
    onConnectCallback,
    onDisconnectCallback,
    onMessageCallback,
    onMessageStatusUpdateCallback,
    onSessionStatusUpdateCallback,
    onQRCodeCallback,
    showNotification
  ]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected || connectionAttemptRef.current) {
      console.log('Already connected or connection in progress');
      return;
    }

    connectionAttemptRef.current = true;
    console.log('Attempting to connect to:', serverUrl);

    try {
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'], // Allow fallback to polling
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      setupSocketListeners(newSocket);
      
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      // Reset connection attempt flag after successful connection
      newSocket.on('connect', () => {
        connectionAttemptRef.current = false;
      });

      // Reset connection attempt flag on connection error
      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        connectionAttemptRef.current = false;
      });

    } catch (error) {
      console.error('Failed to create socket:', error);
      connectionAttemptRef.current = false;
    }
  }, [serverUrl, setupSocketListeners]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      connectionAttemptRef.current = false;
    }
  }, []);

  const joinSession = useCallback((sessionName: string) => {
    if (socketRef.current?.connected) {
      console.log(`📡 Joining session channel: ${sessionName}`);
      socketRef.current.emit('join-session', sessionName);
    } else {
      console.warn('Socket not connected, cannot join session');
    }
  }, []);

  const leaveSession = useCallback((sessionName: string) => {
    if (socketRef.current?.connected) {
      console.log(`📡 Leaving session channel: ${sessionName}`);
      socketRef.current.emit('leave-session', sessionName);
    }
  }, []);

  const joinChat = useCallback((chatId: string) => {
    if (socketRef.current?.connected) {
      console.log(`📡 Joining chat channel: ${chatId}`);
      socketRef.current.emit('join-chat', chatId);
    } else {
      console.warn('Socket not connected, cannot join chat');
    }
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    if (socketRef.current?.connected) {
      console.log(`📡 Leaving chat channel: ${chatId}`);
      socketRef.current.emit('leave-chat', chatId);
    }
  }, []);

  const clearNewMessageCount = useCallback(() => {
    setNewMessageCount(0);
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/agents`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, [serverUrl]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/stats/realtime`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [serverUrl]);

  const fetchChats = useCallback(async (sessionName: string) => {
    try {
      const response = await fetch(`${serverUrl}/chats/${sessionName}`);
      const data = await response.json();
      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [serverUrl]);

  const fetchChatMessages = useCallback(async (sessionName: string, chatId: string) => {
    try {
      const response = await fetch(`${serverUrl}/chat/${sessionName}/${encodeURIComponent(chatId)}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.reverse());
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  }, [serverUrl]);

  // Initialize connection - FIXED to prevent infinite loops
  useEffect(() => {
    let isMounted = true;

    if (autoConnect && !socketRef.current && !connectionAttemptRef.current) {
      connect();
    }

    // Request notification permission
    if (enableNotifications && notificationConfig.requestPermission !== false && 'Notification' in window) {
      Notification.requestPermission().catch(console.error);
    }

    return () => {
      isMounted = false;
      if (socketRef.current) {
        disconnect();
      }
    };
  }, []); // Empty dependency array to run only once

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    messages,
    sessions,
    chats,
    qrCodes,
    stats,
    newMessageCount,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    joinChat,
    leaveChat,
    clearNewMessageCount,
    fetchSessions,
    fetchStats,
    fetchChats,
    fetchChatMessages,
    showNotification
  };
};
