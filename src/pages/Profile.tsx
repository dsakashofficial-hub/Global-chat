import React, { useState, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, storage } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { Camera, User, Mail, MapPin, Info, Save } from 'lucide-react';

export default function Profile() {
  const { profile, user } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username,
        bio,
        country
      });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      toast.success('Photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-950/50">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <img 
              src={profile?.photoURL} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <Camera className="text-white" size={32} />
            </button>
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
          </div>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUpdateProfile}
          className="glass p-8 rounded-2xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <User size={16} /> Username
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <MapPin size={16} /> Country
              </label>
              <input 
                type="text" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Info size={16} /> Bio
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <><Save size={18} /> Save Changes</>}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
