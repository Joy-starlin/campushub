'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll } from 'framer-motion'
import { 
  Target, 
  Globe, 
  Heart, 
  Users, 
  Calendar, 
  Briefcase, 
  Search, 
  MessageSquare,
  TrendingUp,
  Award,
  Shield,
  Map,
  BookOpen,
  ChevronUp,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react'

// Animated Counter Component
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.1, once: true })

  useEffect(() => {
    if (isInView) {
      const increment = target / (duration / 16)
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, 16)
      return () => clearInterval(timer)
    }
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// Back to Top Button
function BackToTop() {
  const { scrollY } = useScroll()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsVisible(latest > 400)
    })
    return unsubscribe
  }, [scrollY])

  if (!isVisible) return null

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
    >
      <ChevronUp className="w-5 h-5" />
    </motion.button>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Eyebrow */}
            <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Built for students. Open to the world.
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-[52px] font-bold text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
              The hub where university life comes together
            </h1>
            
            {/* Subheading */}
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Bugema Hub started as a simple idea — one place where every student could find what they need. 
              Today it connects students, alumni, and universities across the globe.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
              >
                Join Bugema Hub
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.a>
              <motion.a
                href="/feed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors inline-flex items-center justify-center"
              >
                Explore the platform
              </motion.a>
            </div>
            
            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedCounter target={12000} />+
                </span>
                <span className="text-gray-500 dark:text-gray-400">Members</span>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedCounter target={48} />
                </span>
                <span className="text-gray-500 dark:text-gray-400">Universities</span>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedCounter target={6} />
                </span>
                <span className="text-gray-500 dark:text-gray-400">Countries</span>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <AnimatedCounter target={2400} />+
                </span>
                <span className="text-gray-500 dark:text-gray-400">Posts</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ORIGIN STORY */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-24 h-24 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <div className="flex justify-center space-x-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      <div className="w-3 h-3 bg-blue-400 rounded-full" />
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Story Text */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider mb-4">
                Our story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Started at Bugema University. Built for everyone.
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 mb-8">
                <p>
                  What began as a campus project at Bugema University quickly grew into something much bigger. 
                  We saw students struggling to connect, find resources, and navigate university life efficiently.
                </p>
                <p>
                  Our team of student developers built the first version in just three months, focusing on the 
                  real problems we faced every day: finding study groups, staying updated on events, and 
                  connecting with alumni.
                </p>
                <p>
                  Today, Bugema Hub serves thousands of students across multiple countries, but our mission 
                  remains the same: to create the ultimate student experience platform that adapts to every 
                  university's unique needs.
                </p>
              </div>
              
              {/* Quote */}
              <div className="border-l-4 border-blue-600 pl-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                <p className="text-gray-700 dark:text-gray-300 italic mb-2">
                  "We built the platform we wished existed when we were students."
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">— Bugema Hub Founders</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MISSION, VISION, VALUES */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our foundation
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-7 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mission</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                To connect every student with the resources, opportunities, and community they need to thrive 
                in their academic and professional journey.
              </p>
            </motion.div>
            
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-7 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vision</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                A world where every university student has access to a unified platform that enhances their 
                educational experience and prepares them for global success.
              </p>
            </motion.div>
            
            {/* Values Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-7 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Values</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Innovation, inclusivity, and impact. We believe in building solutions that truly serve 
                students' needs while fostering a supportive global community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything a student needs, in one place
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              20 features built around real student problems
            </p>
          </motion.div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              { name: 'News Feed', icon: MessageSquare, desc: 'Stay updated with campus news' },
              { name: 'Events', icon: Calendar, desc: 'Never miss important events' },
              { name: 'Clubs', icon: Users, desc: 'Join student organizations' },
              { name: 'Marketplace', icon: Briefcase, desc: 'Buy and sell items' },
              { name: 'Jobs & Internships', icon: Briefcase, desc: 'Career opportunities' },
              { name: 'Lost & Found', icon: Search, desc: 'Find lost items' },
              { name: 'Ride Sharing', icon: Globe, desc: 'Share rides to campus' },
              { name: 'Study Groups', icon: BookOpen, desc: 'Academic collaboration' },
              { name: 'Alumni Network', icon: Users, desc: 'Connect with graduates' },
              { name: 'University Partnerships', icon: Globe, desc: 'Partner institutions' },
              { name: 'Anonymous Feedback', icon: MessageSquare, desc: 'Share thoughts privately' },
              { name: 'PDF Resources', icon: BookOpen, desc: 'Download materials' },
              { name: 'Live Chat', icon: MessageSquare, desc: 'Real-time conversations' },
              { name: 'Leaderboard', icon: TrendingUp, desc: 'Top contributors' },
              { name: 'Verified Badges', icon: Shield, desc: 'Trust and verification' },
              { name: 'Directions & Map', icon: Map, desc: 'Campus navigation' },
              { name: 'Mentorship', icon: Star, desc: 'Guidance from experts' },
              { name: 'Global Search', icon: Search, desc: 'Find anything instantly' },
              { name: 'Public API', icon: Globe, desc: 'Developer access' }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* STATS WITH BACKGROUND */}
      <section className="py-20 bg-[#0F4FA8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '12,000+', label: 'Active members' },
              { number: '48', label: 'Partner universities' },
              { number: '6', label: 'Countries' },
              { number: '99%', label: 'Student satisfaction' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE TEAM */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The people behind Bugema Hub
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Sarah Johnson', role: 'CEO & Co-Founder', university: 'Bugema University', initials: 'SJ' },
              { name: 'Michael Chen', role: 'CTO & Co-Founder', university: 'Bugema University', initials: 'MC' },
              { name: 'Emily Davis', role: 'Head of Product', university: 'Makerere University', initials: 'ED' },
              { name: 'James Wilson', role: 'Lead Developer', university: 'Bugema University', initials: 'JW' },
              { name: 'Lisa Anderson', role: 'Community Manager', university: 'Kyambogo University', initials: 'LA' },
              { name: 'David Kim', role: 'UX Designer', university: 'Bugema University', initials: 'DK' },
              { name: 'Rachel Brown', role: 'Marketing Lead', university: 'Uganda Christian University', initials: 'RB' },
              { name: 'Alex Thompson', role: 'Backend Engineer', university: 'Bugema University', initials: 'AT' }
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ borderColor: '#1A6FE8' }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">
                    {member.initials}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {member.role}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {member.university}
                </p>
                <button className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our journey
            </h2>
          </motion.div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-300 dark:bg-gray-600" />
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {[
                { year: '2022', title: 'Bugema Hub founded at Bugema University', desc: 'Started as a campus project with 3 student developers' },
                { year: '2023', title: 'First 1,000 members joined', desc: 'Rapid growth across Bugema University campus' },
                { year: '2023', title: 'Marketplace and clubs launched', desc: 'Added core features for student engagement' },
                { year: '2026', title: 'Expanded to 5 universities in Uganda', desc: 'Partnership with major universities in the country' },
                { year: '2026', title: 'International expansion begins', desc: 'First universities outside Uganda joined the platform' },
                { year: '2026', title: '10,000+ global members', desc: 'Reached major milestone with global community' }
              ].map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-5/12">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                      <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full mb-3">
                        {milestone.year}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {milestone.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900" />
                  </div>
                  
                  <div className="w-5/12" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER UNIVERSITIES */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Universities on Bugema Hub
            </h2>
          </motion.div>
          
          {/* Scrolling Logos */}
          <div className="space-y-8">
            {/* First Row - Left to Right */}
            <div className="relative overflow-hidden">
              <div className="flex space-x-8 animate-scroll-left">
                {['Bugema University', 'Makerere University', 'Kyambogo University', 'Uganda Christian University', 'Muni University', 'Gulu University', 'Busitema University', 'Kabale University'].map((uni, index) => (
                  <div key={`${uni}-1-${index}`} className="flex-shrink-0">
                    <div className="w-32 h-16 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{uni}</span>
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {['Bugema University', 'Makerere University', 'Kyambogo University', 'Uganda Christian University', 'Muni University', 'Gulu University', 'Busitema University', 'Kabale University'].map((uni, index) => (
                  <div key={`${uni}-2-${index}`} className="flex-shrink-0">
                    <div className="w-32 h-16 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{uni}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Second Row - Right to Left */}
            <div className="relative overflow-hidden">
              <div className="flex space-x-8 animate-scroll-right">
                {['Uganda Martyrs University', 'Nkumba University', 'Victoria University', 'International University', 'St. Augustine University', 'Uganda Technology University', 'African Bible University', 'Livingstone International University'].map((uni, index) => (
                  <div key={`${uni}-1-${index}`} className="flex-shrink-0">
                    <div className="w-32 h-16 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{uni}</span>
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {['Uganda Martyrs University', 'Nkumba University', 'Victoria University', 'International University', 'St. Augustine University', 'Uganda Technology University', 'African Bible University', 'Livingstone International University'].map((uni, index) => (
                  <div key={`${uni}-2-${index}`} className="flex-shrink-0">
                    <div className="w-32 h-16 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{uni}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to join the community?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Sign up free. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                Create account
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.a>
              <motion.a
                href="/about"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                Learn more
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}

