import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Smile, 
  MoreVertical,
  Globe,
  Paperclip
} from 'lucide-react';
import { formatTime, cn } from '../lib/utils';
import EmojiPicker from 'emoji-picker-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

export default function GlobalChat() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'global_messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || !profile) return;

    const messageData = {
      senderId: user.uid,
      senderName: profile.username,
      senderPhoto: profile.photoURL,
      text: newMessage,
      type: 'text',
      timestamp: serverTimestamp(),
      status: 'sent'
    };

    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      await addDoc(collection(db, 'global_messages'), messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `global_chat/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'global_messages'), {
        senderId: user.uid,
        senderName: profile.username,
        senderPhoto: profile.photoURL,
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
    <div className="flex flex-col h-full bg-slate-950/50">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="font-bold">Global Chat</h2>
            <p className="text-xs text-slate-500">Connect with everyone worldwide</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-all">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.uid;
          const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

          return (
            <motion.div
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id}
              className={cn(
                "flex items-end gap-2",
                isMe ? "flex-row-reverse" : "flex-row"
              )}
            >
              {!isMe && showAvatar && (
                <img 
                  src={(msg as any).senderPhoto} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-white/10"
                  referrerPolicy="no-referrer"
                />
              )}
              {!isMe && !showAvatar && <div className="w-8" />}
              
              <div className={cn(
                "max-w-[70%] space-y-1",
                isMe ? "items-end" : "items-start"
              )}>
                {!isMe && showAvatar && (
                  <span className="text-[10px] text-slate-500 ml-1">{msg.senderName}</span>
                )}
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  isMe 
                    ? "bg-primary text-white rounded-br-none" 
                    : "bg-white/10 text-slate-200 rounded-bl-none"
                )}>
                  {msg.type === 'image' ? (
                    <img src={msg.mediaUrl} alt="Shared" className="rounded-lg max-w-full h-auto" />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 px-1">
                  {formatTime(msg.timestamp)}
                </span>
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
