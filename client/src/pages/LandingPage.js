import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, MessageSquare, Users, Sparkles, ArrowRight, CheckCircle, 
  Github, Twitter, Linkedin, Lock, UserPlus, FolderKanban, 
  BarChart3, Zap, Shield, Clock, Target,
  Code, Brain, Activity, Award, ListTodo, Mail, Eye
} from 'lucide-react';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"
          style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 backdrop-blur-sm bg-gray-900/30 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Rocket className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              ProjectSync
            </span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login" className="px-6 py-2 rounded-lg bg-purple-600/20 border border-purple-500 hover:bg-purple-600/40 transition-all duration-300">
              Sign In
            </Link>
            <Link to="/register" className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-green-400 bg-clip-text text-transparent">
              Project & Task Management
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-purple-300">
              Where AI Meets Mentor Guidance
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Full-stack collaborative system with role-based dashboards, real-time notifications, 
            team invitations, and AI-powered NLP chat analysis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="group px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2 text-lg font-semibold">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Core Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 hover:border-blue-400 transition-all duration-300 backdrop-blur-sm">
              <Lock className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-blue-300">Authentication & Security</h3>
              <p className="text-gray-300">JWT authentication with bcrypt password hashing and role-based access control for Admin, Members, and Mentors</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm">
              <Mail className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-purple-300">Team Management</h3>
              <p className="text-gray-300">Email-based invitations with real-time Socket.IO alerts, unique team codes, and 7-day auto-expiry system</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 hover:border-green-400 transition-all duration-300 backdrop-blur-sm">
              <MessageSquare className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-green-300">Real-Time Chat</h3>
              <p className="text-gray-300">Socket.IO powered instant messaging with typing indicators, online presence tracking, and browser notifications</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-900/40 to-amber-900/40 border border-orange-500/30 hover:border-orange-400 transition-all duration-300 backdrop-blur-sm">
              <Brain className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-orange-300">AI Chat Analysis</h3>
              <p className="text-gray-300">Advanced NLP-powered chat health monitoring with weekly mentor reports, contribution scoring, and communication insights</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-900/40 to-rose-900/40 border border-pink-500/30 hover:border-pink-400 transition-all duration-300 backdrop-blur-sm">
              <Sparkles className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-pink-300">AI Recommendations</h3>
              <p className="text-gray-300">Intelligent task prioritization, resource allocation tips, and automated workflow improvements based on team patterns</p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/30 hover:border-indigo-400 transition-all duration-300 backdrop-blur-sm">
              <BarChart3 className="w-12 h-12 text-indigo-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-indigo-300">Analytics & Metrics</h3>
              <p className="text-gray-300">Comprehensive contribution tracking, burndown charts, performance ranking, and real-time project progress monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-purple-500/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">&copy; 2025 ProjectSync. Built with MERN + AI/NLP</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
