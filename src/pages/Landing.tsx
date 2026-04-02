import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquare, Globe, Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/5 glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-white">
            <MessageSquare size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">Global Messenger</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-all">Sign In</Link>
          <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium"
          >
            <Zap size={16} /> Real-time messaging for everyone
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
          >
            Connect with the world <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">in real-time.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Experience the next generation of global communication. Private chats, 
            group conversations, and a worldwide community all in one place.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20">
              Start Chatting Now <ArrowRight size={20} />
            </Link>
            <Link to="/global" className="w-full sm:w-auto glass hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all">
              Join Global Room
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-slate-950/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Secure & Private', desc: 'Your conversations are protected with industry-standard security.' },
            { icon: Globe, title: 'Global Reach', desc: 'Connect with users from every corner of the world instantly.' },
            { icon: Users, title: 'Group Dynamics', desc: 'Create and manage groups with advanced admin controls.' }
          ].map((feature, idx) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-3xl space-y-4 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-all">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 Global Messenger. All rights reserved.</p>
      </footer>
    </div>
  );
}
