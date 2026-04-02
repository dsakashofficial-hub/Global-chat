import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Message, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Check,
  CheckCheck
} from 'lucide-react';
import { formatTime, cn } from '../lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

interface PrivateChatProps {
  chatId: string;
  targetUser: UserProfile | null;
}

export default function PrivateChat({ chatId, targetUser }: PrivateChatProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      
      // Mark messages as seen
      msgs.forEach(msg => {
        if (msg.senderId !== user?.uid && msg.status !== 'seen') {
          updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), { status: 'seen' });
        }
      });

      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || !profile) return;

    const text = newMessage;
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      const msgData = {
        senderId: user.uid,
        senderName: profile.username,
        text,
        type: 'text',
        timestamp: serverTimestamp(),
        status: 'sent'
      };

      await addDoc(collection(db, 'chats', chatId, 'messages'), msgData);
      
      // Update chat last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text,
          timestamp: serverTimestamp()
        }
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        senderName: profile.username,
        text: '',
        type: 'image',
        mediaUrl: url,
        timestamp: serverTimestamp(),
        status: 'sent'
      });
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between glass">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={targetUser?.photoURL || `https://ui-avatars.com/api/?name=User&background=random`} 
              alt="" 
              className="w-10 h-10 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
            <span className={cn(
              "absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-900 rounded-full",
              targetUser?.status === 'online' ? "bg-success" : "bg-slate-500"
            )}></span>
          </div>
          <div>
            <h2 className="font-bold text-sm">{targetUser?.username || 'Chat'}</h2>
            <p className="text-[10px] text-slate-500">
              {targetUser?.status === 'online' ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white transition-all"><Phone size={18} /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-all"><Video size={18} /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.uid;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex flex-col",
                isMe ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[75%] p-3 rounded-2xl text-sm shadow-sm relative group",
                isMe 
                  ? "bg-primary text-white rounded-br-none" 
                  : "bg-white/10 text-slate-200 rounded-bl-none"
              )}>
                {msg.type === 'image' ? (
                  <img src={msg.mediaUrl} alt="Shared" className="rounded-lg max-w-full h-auto" />
                ) : (
                  <p>{msg.text}</p>
                )}
                
                <div className={cn(
                  "flex items-center gap-1 mt-1 justify-end",
                  isMe ? "text-white/70" : "text-slate-500"
                )}>
                  <span className="text-[9px]">{formatTime(msg.timestamp)}</span>
                  {isMe && (
                    msg.status === 'seen' ? <CheckCheck size={12} className="text-blue-300" /> : <Check size={12} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/5 relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 left-4 z-50"
            >
              <EmojiPicker 
                theme={'dark' as any}
                onEmojiClick={(emoji) => setNewMessage(prev => prev + emoji.emoji)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/10"
        >
          <div className="flex items-center gap-1 px-2">
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-primary transition-all"
            >
              <Smile size={20} />
            </button>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-primary transition-all"
            >
              <Paperclip size={20} />
            </button>
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
          />

          <div className="flex items-center gap-1 px-2">
            <button 
              type="button"
              className="p-2 text-slate-400 hover:text-primary transition-all"
            >
              <Mic size={20} />
            </button>
            <button 
              type="submit"
              disabled={!newMessage.trim() && !loading}
              className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
