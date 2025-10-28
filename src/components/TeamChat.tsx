import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Search, 
  Users, 
  Plus,
  Phone,
  Video,
  Info,
  X,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Image,
  Download,
  Bell
} from 'lucide-react';
import chatService, { ChatMessage, ChatRoom, ChatUser } from '../services/chatService';
import NotificationCenter from './NotificationCenter';
import './TeamChat.css';

interface TeamChatProps {
  onLogout: () => void;
}

const TeamChat: React.FC<TeamChatProps> = ({ onLogout }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize chat service
    const currentUser = chatService.getCurrentUser();
    if (!currentUser) return;

    // Load initial data
    setRooms(chatService.getRooms());
    setUsers(chatService.getUsers());
    
    // Set first room as current
    const firstRoom = chatService.getRooms()[0];
    if (firstRoom) {
      setCurrentRoom(firstRoom);
      setMessages(chatService.getMessages(firstRoom.id));
    }

    // Set up real-time listeners
    const unsubscribeMessages = chatService.onMessagesUpdate((newMessages) => {
      if (currentRoom) {
        setMessages(chatService.getMessages(currentRoom.id));
      }
    });

    const unsubscribeRooms = chatService.onRoomsUpdate((newRooms) => {
      setRooms(newRooms);
    });

    const unsubscribeTyping = chatService.onTypingUpdate((users) => {
      setTypingUsers(users);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeRooms();
      unsubscribeTyping();
    };
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    if (!currentRoom) return;

    try {
      if (selectedFile) {
        const fileData = await chatService.uploadFile(selectedFile);
        chatService.sendMessage(currentRoom.id, newMessage || `📎 ${selectedFile.name}`, 'file', fileData);
        setSelectedFile(null);
      } else {
        chatService.sendMessage(currentRoom.id, newMessage);
      }
      
      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line with Shift+Enter
      return;
    } else {
      // Start typing indicator
      if (!isTyping && currentRoom) {
        setIsTyping(true);
        chatService.startTyping(currentRoom.id);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    }
  };

  const stopTyping = () => {
    if (isTyping && currentRoom) {
      setIsTyping(false);
      chatService.stopTyping(currentRoom.id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="file-icon" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="file-icon" />;
      default:
        return <FileText className="file-icon" />;
    }
  };

  const emojis = ['😀', '😊', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '🚀'];

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="team-chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h1 className="chat-title">Team Chat</h1>
          <div className="online-indicator">
            <div className="online-dot"></div>
            <span>{users.filter(u => u.isOnline).length} online</span>
          </div>
        </div>
        <div className="header-right">
          <button 
            className="header-btn notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <div className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
          <button className="header-btn" onClick={() => setShowUserList(!showUserList)}>
            <Users size={20} />
          </button>
          <button className="header-btn">
            <Phone size={20} />
          </button>
          <button className="header-btn">
            <Video size={20} />
          </button>
          <button className="header-btn" onClick={onLogout}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="chat-main">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="search-container">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="new-room-btn"
              onClick={() => setShowCreateRoom(true)}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="rooms-list">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentRoom(room);
                  setMessages(chatService.getMessages(room.id));
                }}
                whileHover={{ backgroundColor: '#f5f5f5' }}
                transition={{ duration: 0.2 }}
              >
                <div className="room-avatar">
                  {room.type === 'general' ? '💬' : 
                   room.type === 'job' ? '💼' : '👤'}
                </div>
                <div className="room-info">
                  <div className="room-name">{room.name}</div>
                  <div className="room-last-message">
                    {room.lastMessage ? room.lastMessage.content.substring(0, 50) + '...' : 'No messages yet'}
                  </div>
                </div>
                <div className="room-meta">
                  <div className="room-time">
                    {room.lastActivity ? formatTime(room.lastActivity) : ''}
                  </div>
                  {room.isActive && <div className="active-indicator"></div>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {currentRoom ? (
            <>
              {/* Chat Header */}
              <div className="chat-room-header">
                <div className="room-info">
                  <div className="room-avatar-large">
                    {currentRoom.type === 'general' ? '💬' : 
                     currentRoom.type === 'job' ? '💼' : '👤'}
                  </div>
                  <div>
                    <h3>{currentRoom.name}</h3>
                    <p>{currentRoom.participants.length} members</p>
                  </div>
                </div>
                <div className="room-actions">
                  <button className="action-btn">
                    <Info size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === chatService.getCurrentUser()?.id;
                    const showDate = index === 0 || 
                      formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <motion.div
                            className="date-divider"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {formatDate(message.timestamp)}
                          </motion.div>
                        )}
                        <motion.div
                          className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {!isCurrentUser && (
                            <div className="message-avatar">
                              <img 
                                src={message.senderAvatar || `https://ui-avatars.com/api/?name=${message.senderName}&background=random`} 
                                alt={message.senderName}
                              />
                            </div>
                          )}
                          <div className="message-content">
                            {!isCurrentUser && (
                              <div className="message-sender">{message.senderName}</div>
                            )}
                            <div className="message-bubble">
                              {message.type === 'file' ? (
                                <div className="file-message">
                                  <div className="file-info">
                                    {getFileIcon(message.fileName || '')}
                                    <div>
                                      <div className="file-name">{message.fileName}</div>
                                      <div className="file-size">
                                        {(message.fileSize || 0 / 1024).toFixed(1)} KB
                                      </div>
                                    </div>
                                    <button className="download-btn">
                                      <Download size={16} />
                                    </button>
                                  </div>
                                  {message.content && (
                                    <div className="file-caption">{message.content}</div>
                                  )}
                                </div>
                              ) : (
                                <div className="message-text">{message.content}</div>
                              )}
                              <div className="message-time">
                                {formatTime(message.timestamp)}
                                {isCurrentUser && (
                                  <div className="message-status">
                                    <CheckCheck size={12} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <motion.div
                    className="typing-indicator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <span>{typingUsers.join(', ')} is typing...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                {selectedFile && (
                  <div className="file-preview">
                    <div className="file-preview-info">
                      {getFileIcon(selectedFile.name)}
                      <span>{selectedFile.name}</span>
                    </div>
                    <button 
                      className="remove-file-btn"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="message-input">
                  <button 
                    className="input-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  <div className="emoji-picker-container">
                    <button 
                      className="input-btn"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            className="emoji-btn"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="message-textarea"
                    rows={1}
                  />
                  
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-room-selected">
              <div className="no-room-content">
                <div className="no-room-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a room from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default TeamChat;
