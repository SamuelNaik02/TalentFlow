// Real-time chat service with WebSocket simulation
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mentions?: string[];
  isEdited?: boolean;
  editedAt?: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'candidate' | 'job' | 'general';
  participants: string[];
  lastMessage?: ChatMessage;
  lastActivity: Date;
  isActive: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

class ChatService {
  private messages: ChatMessage[] = [];
  private rooms: ChatRoom[] = [];
  private users: ChatUser[] = [];
  private currentUser: ChatUser | null = null;
  private listeners: ((messages: ChatMessage[]) => void)[] = [];
  private roomListeners: ((rooms: ChatRoom[]) => void)[] = [];

  constructor() {
    this.initializeData();
    this.simulateRealTimeUpdates();
  }

  private initializeData() {
    // Initialize users
    this.users = [
      {
        id: '1',
        name: 'Samuel Naik',
        email: 'samuel@talentflow.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isOnline: true
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@talentflow.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        isOnline: true
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike@talentflow.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily@talentflow.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        isOnline: true
      }
    ];

    this.currentUser = this.users[0]; // Samuel Naik

    // Initialize rooms
    this.rooms = [
      {
        id: '1',
        name: 'General Discussion',
        type: 'general',
        participants: ['1', '2', '3', '4'],
        lastActivity: new Date(),
        isActive: true
      },
      {
        id: '2',
        name: 'Senior Developer Position',
        type: 'job',
        participants: ['1', '2'],
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isActive: true
      },
      {
        id: '3',
        name: 'John Smith - Candidate Discussion',
        type: 'candidate',
        participants: ['1', '3', '4'],
        lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        isActive: true
      }
    ];

    // Initialize sample messages
    this.messages = [
      {
        id: '1',
        content: 'Welcome to TalentFlow team chat! 🎉',
        senderId: '1',
        senderName: 'Samuel Naik',
        senderAvatar: this.users[0].avatar,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'system'
      },
      {
        id: '2',
        content: 'Hey team! Just reviewed the new candidate profiles. John Smith looks promising for the Senior Developer role.',
        senderId: '2',
        senderName: 'Sarah Johnson',
        senderAvatar: this.users[1].avatar,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        type: 'text',
        mentions: ['1']
      },
      {
        id: '3',
        content: 'I agree! His React and TypeScript experience is exactly what we need. Should we schedule an interview?',
        senderId: '1',
        senderName: 'Samuel Naik',
        senderAvatar: this.users[0].avatar,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text'
      },
      {
        id: '4',
        content: 'I\'ve uploaded his technical assessment results. Pretty impressive scores!',
        senderId: '4',
        senderName: 'Emily Davis',
        senderAvatar: this.users[3].avatar,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'file',
        fileName: 'john_smith_assessment.pdf',
        fileSize: 245760,
        fileUrl: '#'
      },
      {
        id: '5',
        content: 'Perfect! Let\'s move him to the interview stage. I\'ll coordinate with the team.',
        senderId: '2',
        senderName: 'Sarah Johnson',
        senderAvatar: this.users[1].avatar,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        type: 'text'
      }
    ];
  }

  private simulateRealTimeUpdates() {
    // Simulate real-time message updates
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new message
        const randomUser = this.users[Math.floor(Math.random() * this.users.length)];
        const sampleMessages = [
          'Great work on the candidate screening!',
          'The new assessment questions are working well.',
          'Anyone available for a quick sync on the hiring pipeline?',
          'Just finished reviewing the latest applications.',
          'The dashboard analytics look amazing! 📊',
          'Thanks for the feedback on the interview process.',
          'Ready for the team meeting at 3 PM?',
          'The new candidate looks promising!'
        ];

        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          senderId: randomUser.id,
          senderName: randomUser.name,
          senderAvatar: randomUser.avatar,
          timestamp: new Date(),
          type: 'text'
        };

        this.messages.push(newMessage);
        this.notifyListeners();
      }
    }, 10000); // Check every 10 seconds
  }

  // Public methods
  getCurrentUser(): ChatUser | null {
    return this.currentUser;
  }

  getUsers(): ChatUser[] {
    return this.users;
  }

  getRooms(): ChatRoom[] {
    return this.rooms.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  getMessages(roomId: string): ChatMessage[] {
    return this.messages.filter(msg => 
      this.rooms.find(room => room.id === roomId)?.participants.includes(msg.senderId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  sendMessage(roomId: string, content: string, type: 'text' | 'file' = 'text', fileData?: { fileName: string; fileSize: number; fileUrl: string }): ChatMessage {
    if (!this.currentUser) throw new Error('User not authenticated');

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderAvatar: this.currentUser.avatar,
      timestamp: new Date(),
      type,
      ...fileData
    };

    this.messages.push(newMessage);
    
    // Update room's last activity
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.lastActivity = new Date();
      room.lastMessage = newMessage;
    }

    this.notifyListeners();
    this.notifyRoomListeners();
    
    return newMessage;
  }

  createRoom(name: string, type: 'candidate' | 'job' | 'general', participantIds: string[]): ChatRoom {
    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      name,
      type,
      participants: [...participantIds, this.currentUser?.id || ''],
      lastActivity: new Date(),
      isActive: true
    };

    this.rooms.push(newRoom);
    this.notifyRoomListeners();
    
    return newRoom;
  }

  searchMessages(query: string): ChatMessage[] {
    return this.messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Event listeners
  onMessagesUpdate(callback: (messages: ChatMessage[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  onRoomsUpdate(callback: (rooms: ChatRoom[]) => void): () => void {
    this.roomListeners.push(callback);
    return () => {
      this.roomListeners = this.roomListeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback([...this.messages]));
  }

  private notifyRoomListeners() {
    this.roomListeners.forEach(callback => callback([...this.rooms]));
  }

  // File upload simulation
  uploadFile(file: File): Promise<{ fileName: string; fileSize: number; fileUrl: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fileName: file.name,
          fileSize: file.size,
          fileUrl: URL.createObjectURL(file)
        });
      }, 1000);
    });
  }

  // Typing indicators
  private typingUsers: Set<string> = new Set();
  private typingListeners: ((users: string[]) => void)[] = [];

  startTyping(roomId: string) {
    if (!this.currentUser) return;
    this.typingUsers.add(this.currentUser.id);
    this.notifyTypingListeners();
  }

  stopTyping(roomId: string) {
    if (!this.currentUser) return;
    this.typingUsers.delete(this.currentUser.id);
    this.notifyTypingListeners();
  }

  onTypingUpdate(callback: (users: string[]) => void): () => void {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(l => l !== callback);
    };
  }

  private notifyTypingListeners() {
    const typingUserNames = Array.from(this.typingUsers).map(userId => 
      this.users.find(u => u.id === userId)?.name || 'Unknown'
    );
    this.typingListeners.forEach(callback => callback(typingUserNames));
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
