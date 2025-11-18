import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Bell,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Target,
      title: 'Smart Task Management',
      description: 'AI-powered task prioritization with real-time deadline monitoring',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time chat, role-based dashboards, and team invitations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Burndown charts, contribution metrics, and performance tracking',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'AI Recommendations',
      description: 'Intelligent insights for project health and risk assessment',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Instant updates via Socket.IO for all team activities',
      color: 'from-red-500 to-rose-500'
    },
    {
      icon: Shield,
      title: 'Secure & Scalable',
      description: 'JWT authentication with role-based access control',
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  const stats = [
    { icon: CheckCircle2, value: '1000+', label: 'Tasks Completed', color: 'text-cyan-400' },
    { icon: Users, value: '500+', label: 'Active Teams', color: 'text-purple-400' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate', color: 'text-green-400' },
    { icon: Award, value: '24/7', label: 'AI Monitoring', color: 'text-yellow-400' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(139, 92, 246, 0.3), transparent 50%)`
          }}
        />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Floating Orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              background: `radial-gradient(circle, ${
                i === 0 ? 'rgba(99, 102, 241, 0.2)' :
                i === 1 ? 'rgba(168, 85, 247, 0.2)' :
                'rgba(59, 130, 246, 0.2)'
              }, transparent)`,
              top: `${20 + i * 30}%`,
              left: `${10 + i * 35}%`
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 container mx-auto px-6 py-6"
      >
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="relative">
              <Rocket className="w-8 h-8 text-cyan-400" />
              <motion.div
                className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ProjectSync
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">AI-Powered Project Management</span>
            </motion.span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Collaborate Smarter,
            </span>
            <br />
            <span className="text-white">Ship Faster</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Experience the future of team collaboration with AI-powered insights, real-time updates,
            and intelligent task management. Built for teams that move fast.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold text-lg shadow-2xl shadow-purple-500/50 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-semibold text-lg backdrop-blur-sm transition-all duration-300"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Animated Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            className="mt-20 relative"
          >
            <motion.div
              animate={floatingAnimation}
              className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-3xl" />
              <div className="relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="h-16 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-sm"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -left-10 top-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/30 shadow-xl"
            >
              <div className="text-cyan-400 text-sm font-semibold">Tasks Completed</div>
              <div className="text-2xl font-bold text-white">+156%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -right-10 bottom-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl p-4 rounded-xl border border-purple-500/30 shadow-xl"
            >
              <div className="text-purple-400 text-sm font-semibold">Team Productivity</div>
              <div className="text-2xl font-bold text-white">98.5%</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-400">Everything you need to manage projects like a pro</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>

              <motion.div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle, ${feature.color.includes('cyan') ? '#06b6d4' : '#a855f7'}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Clock className="w-16 h-16 text-cyan-400" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="text-white">Your Team's Workflow?</span>
            </h2>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of teams already using ProjectSync to deliver projects faster and smarter.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="group relative px-10 py-5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 font-bold text-lg shadow-2xl shadow-purple-500/50 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Started for Free</span>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </span>
            </motion.button>

            <p className="mt-6 text-gray-400">No credit card required • 14-day free trial</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Rocket className="w-6 h-6 text-cyan-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ProjectSync
                </span>
              </div>
              <p className="text-gray-400">
                AI-powered project management for modern teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Security</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">About</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Careers</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-cyan-400 cursor-pointer transition-colors">API Docs</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 ProjectSync. Built with ❤️ using React, Node.js & AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
