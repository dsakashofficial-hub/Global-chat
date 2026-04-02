export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  photoURL: string;
  bio: string;
  country: string;
  status: 'online' | 'offline';
  lastSeen: any;
  privacy: {
    whoCanMessage: 'everyone' | 'friends';
    showOnlineStatus: boolean;
  };
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'image' | 'audio';
  mediaUrl?: string;
  timestamp: any;
  status: 'sent' | 'delivered' | 'seen';
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group' | 'global';
  participants: string[];
  lastMessage?: Message;
  groupAdmin?: string[];
  groupImage?: string;
}
