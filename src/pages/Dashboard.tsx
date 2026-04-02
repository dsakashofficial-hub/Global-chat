import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  or
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { UserProfile, ChatRoom } from '../types';
import { motion } from 'motion/react';
import { Search, UserPlus, MessageSquare, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import PrivateChat from '../components/PrivateChat';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessage.timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('username', '>=', val),
      where('username', '<=', val + '\uf8ff')
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs
      .map(doc => doc.data() as UserProfile)
      .filter(u => u.uid !== user?.uid);
    setSearchResults(results);
  };

  const startPrivateChat = async (targetUser: UserProfile) => {
    // Check if chat already exists
    const existingChat = chats.find(c => 
      c.type === 'private' && c.participants.includes(targetUser.uid)
    );

    if (existingChat) {
      setActiveChat(existingChat.id);
      setActiveUser(targetUser);
    } else {
      // Create new chat
      const newChatData = {
        type: 'private',
        participants: [user?.uid, targetUser.uid],
        createdAt: serverTimestamp(),
        lastMessage: {
          text: 'Started a new conversation',
          timestamp: serverTimestamp()
        }
      };
      const docRef = await addDoc(collection(db, 'chats'), newChatData);
      setActiveChat(docRef.id);
      setActiveUser(targetUser);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar / Chat List */}
      <div className="w-full md:w-80 border-r border-white/5 flex flex-col glass-dark">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-50 shadow-2xl">
                {searchResults.map(u => (
                  <button
                    key={u.uid}
                    onClick={() => startPrivateChat(u)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-left"
                  >
                    <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-sm font-semibold">{u.username}</p>
                      <p className="text-xs text-slate-500">{u.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-all">
              <MessageSquare size={16} /> Private
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 text-slate-400 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all">
              <Users size={16} /> Groups
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-2">
              <MessageSquare size={48} className="opacity-20" />
              <p className="text-sm">No conversations yet. Search for someone to start chatting!</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherParticipantId = chat.participants.find(p => p !== user?.uid);
              // In a real app, you'd fetch the other user's profile here or store it in the chat doc
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    activeChat === chat.id ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5"
                  )}
                >
                  <div className="relative">
                    <img 
                      src={chat.groupImage || `https://ui-avatars.com/api/?name=${chat.name || 'Chat'}&background=random`} 
                      alt="" 
                      className="w-12 h-12 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-slate-900 rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold truncate">{chat.name || 'Private Chat'}</p>
                      <span className="text-[10px] text-slate-500">
                        {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage?.text}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 hidden md:flex flex-col bg-slate-950/30">
        {activeChat ? (
          <PrivateChat chatId={activeChat} targetUser={activeUser} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
              <MessageSquare size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-300">Your Messages</h3>
              <p className="text-sm max-w-xs">Select a conversation or start a new one to begin messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
