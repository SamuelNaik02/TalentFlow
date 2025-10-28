import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageCircle, Users, Check } from 'lucide-react';
import chatService, { ChatMessage, ChatRoom } from '../services/chatService';
import './NotificationCenter.css';

interface Notification {
  id: string;
  type: 'message' | 'mention' | 'room_created' | 'user_joined';
  title: string;
  message: string;
  timestamp: Date;
  roomId?: string;
  senderId?: string;
  senderName?: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize with sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New message in General Discussion',
        message: 'Sarah Johnson: Hey team! Just reviewed the new candidate profiles.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        roomId: '1',
        senderId: '2',
        senderName: 'Sarah Johnson',
        isRead: false
      },
      {
        id: '2',
        type: 'mention',
        title: 'You were mentioned',
        message: 'Emily Davis mentioned you in Senior Developer Position discussion',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        roomId: '2',
        senderId: '4',
        senderName: 'Emily Davis',
        isRead: false
      },
      {
        id: '3',
        type: 'room_created',
        title: 'New room created',
        message: 'Mike Chen created a new room: "Frontend Developer Position"',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        roomId: '4',
        senderId: '3',
        senderName: 'Mike Chen',
        isRead: true
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.isRead).length);

    // Listen for new messages
    const unsubscribeMessages = chatService.onMessagesUpdate((messages) => {
      const currentUser = chatService.getCurrentUser();
      if (!currentUser) return;

      // Check for new messages not from current user
      const newMessages = messages.filter(msg => 
        msg.senderId !== currentUser.id && 
        !notifications.some(n => n.id === `msg_${msg.id}`)
      );

      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        const room = chatService.getRooms().find(r => 
          r.participants.includes(latestMessage.senderId)
        );

        if (room) {
          const newNotification: Notification = {
            id: `msg_${latestMessage.id}`,
            type: 'message',
            title: `New message in ${room.name}`,
            message: `${latestMessage.senderName}: ${latestMessage.content}`,
            timestamp: latestMessage.timestamp,
            roomId: room.id,
            senderId: latestMessage.senderId,
            senderName: latestMessage.senderName,
            isRead: false
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      }
    });

    return () => {
      unsubscribeMessages();
    };
  }, [notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} />;
      case 'mention':
        return <Users size={16} />;
      case 'room_created':
        return <MessageCircle size={16} />;
      case 'user_joined':
        return <Users size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return '#4CAF50';
      case 'mention':
        return '#FF9800';
      case 'room_created':
        return '#2196F3';
      case 'user_joined':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="notification-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            className="notification-center"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="notification-header">
              <div className="header-left">
                <Bell size={20} />
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <div className="unread-badge">
                    {unreadCount}
                  </div>
                )}
              </div>
              <div className="header-right">
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read-btn"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  className="close-btn"
                  onClick={onClose}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <Bell size={48} />
                  <h4>No notifications</h4>
                  <p>You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.isRead && <div className="unread-dot"></div>}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    <button 
                      className="clear-notification-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(notification.id);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="notification-footer">
                <button 
                  className="clear-all-btn"
                  onClick={() => setNotifications([])}
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;
