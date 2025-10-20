import React, { useEffect, useState, useCallback } from 'react';
import { Bell, X, MessageCircle, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useWhatsAppWebSocket } from '../hooks/useWhatsAppWebSocket';
import type { Message, QRCodeData } from '../lib/types';

interface NotificationComponentProps {
  serverUrl?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoHideDuration?: number;
  showToasts?: boolean;
  playSound?: boolean;
  onMessageReceived?: (message: Message) => void;
  onQRCodeReceived?: (qrData: QRCodeData) => void;
}

interface ToastNotification {
  id: string;
  type: 'message' | 'status' | 'qr' | 'session';
  title: string;
  message: string;
  timestamp: Date;
}

export const WhatsAppNotificationComponent: React.FC<NotificationComponentProps> = ({
  serverUrl = 'http://67.211.221.109:3002',
  position = 'top-right',
  maxNotifications = 5,
  autoHideDuration = 5000,
  showToasts = true,
  playSound = true,
  onMessageReceived,
  onQRCodeReceived
}) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Memoize callbacks to prevent hook recreation
  const handleMessage = useCallback((message: Message) => {
    if (showToasts) {
      const newNotification: ToastNotification = {
        id: Date.now().toString(),
        type: 'message',
        title: `New ${message.fromMe ? 'Outgoing' : 'Incoming'} Message`,
        message: (message.body || message.message_body || '[Media]').substring(0, 100),
        timestamp: new Date()
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));

      if (autoHideDuration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, autoHideDuration);
      }

      if (playSound) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    }
    onMessageReceived?.(message);
  }, [showToasts, maxNotifications, autoHideDuration, playSound, onMessageReceived]);

  const handleQRCode = useCallback((qrData: QRCodeData) => {
    if (showToasts) {
      const newNotification: ToastNotification = {
        id: Date.now().toString(),
        type: 'qr',
        title: 'QR Code Generated',
        message: `Scan QR code for session: ${qrData.sessionName}`,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));

      if (autoHideDuration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, autoHideDuration);
      }
    }
    onQRCodeReceived?.(qrData);
  }, [showToasts, maxNotifications, autoHideDuration, onQRCodeReceived]);

  const handleSessionStatusUpdate = useCallback((sessionData: { sessionName: string; status: string }) => {
    if (showToasts) {
      const newNotification: ToastNotification = {
        id: Date.now().toString(),
        type: 'session',
        title: 'Session Status Update',
        message: `${sessionData.sessionName}: ${sessionData.status}`,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));

      if (autoHideDuration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, autoHideDuration);
      }
    }
  }, [showToasts, maxNotifications, autoHideDuration]);

  const { isConnected, newMessageCount } = useWhatsAppWebSocket({
    serverUrl,
    onMessage: handleMessage,
    onQRCode: handleQRCode,
    onSessionStatusUpdate: handleSessionStatusUpdate,
    enableNotifications: true
  });

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'session':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'qr':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'status':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      {showToasts && (
        <div className={`fixed ${getPositionClasses()} z-40 w-80 space-y-2 max-h-screen overflow-y-auto`}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-2"
            >
              Clear all notifications
            </button>
          )}
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className={`fixed bottom-4 left-4 z-40 px-3 py-2 rounded-full text-xs font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          {newMessageCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              {newMessageCount}
            </span>
          )}
        </div>
      </div>
    </>
  );
};