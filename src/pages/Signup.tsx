import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { User, Mail, Lock, UserPlus, MessageSquare } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        email,
        photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`,
        bio: 'Hey there! I am using Global Messenger.',
        country: 'Unknown',
        status: 'online',
        lastSeen: serverTimestamp(),
        privacy: {
          whoCanMessage: 'everyone',
          showOnlineStatus: true,
        },
      });

      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary/20 rounded-xl text-primary mb-2">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-slate-400">Join the global community today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
