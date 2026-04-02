import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, MessageSquare } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message);
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-slate-400">Sign in to continue your conversations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
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
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
