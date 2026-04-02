import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { 
  Shield, 
  Bell, 
  Eye, 
  Lock, 
  Moon, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const { profile, user } = useAuth();
  const [privacy, setPrivacy] = useState(profile?.privacy || {
    whoCanMessage: 'everyone',
    showOnlineStatus: true
  });

  const updatePrivacy = async (key: string, value: any) => {
    if (!user) return;
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    try {
      await updateDoc(doc(db, 'users', user.uid), { privacy: newPrivacy });
      toast.success('Settings updated!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const sections = [
    {
      title: 'Account & Security',
      icon: Shield,
      items: [
        { label: 'Privacy Settings', icon: Eye, description: 'Manage who can see your profile' },
        { label: 'Security', icon: Lock, description: 'Password and authentication' },
        { label: 'Notifications', icon: Bell, description: 'Manage your alerts' },
      ]
    },
    {
      title: 'Appearance',
      icon: Moon,
      items: [
        { label: 'Theme', icon: Moon, description: 'Dark / Light mode' },
        { label: 'Chat Wallpapers', icon: Smartphone, description: 'Customize your chat background' },
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-950/50">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <div className="space-y-6">
          {/* Privacy Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl space-y-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="text-primary" size={20} /> Privacy Controls
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium">Show Online Status</p>
                  <p className="text-xs text-slate-500">Let others know when you're active</p>
                </div>
                <button 
                  onClick={() => updatePrivacy('showOnlineStatus', !privacy.showOnlineStatus)}
                  className={`w-12 h-6 rounded-full transition-all relative ${privacy.showOnlineStatus ? 'bg-primary' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacy.showOnlineStatus ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium">Who can message you</p>
                  <p className="text-xs text-slate-500">Control your accessibility</p>
                </div>
                <select 
                  value={privacy.whoCanMessage}
                  onChange={(e) => updatePrivacy('whoCanMessage', e.target.value)}
                  className="bg-slate-800 border-none rounded-lg text-sm focus:ring-primary"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends only</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Other Sections */}
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-2xl space-y-4"
            >
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <section.icon className="text-primary" size={20} /> {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button 
                    key={item.label}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-primary transition-all">
                        <item.icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-600" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
