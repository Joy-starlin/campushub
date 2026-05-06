"use client";

import { useState } from "react";
import SignupModal from "./components/SignupModal";
import FeatureSlideshow from "./components/FeatureSlideshow";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar, Users, ShoppingBag, Globe, Trophy, BookOpen, Briefcase,
  GraduationCap, Car, MapPin, MessageSquare, FileText, Bell, Video,
  MessageCircle, BarChart3, Medal, HandHeart, School, SearchCheck,
  Rss, CheckCircle, ArrowRight, Sparkles, UserCheck, Zap, Star
} from "lucide-react";
import StarRating from "./components/StarRating";
import toast from "react-hot-toast";

export default function Home() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [homepageRating, setHomepageRating] = useState(0);
  const [showRatingFeedback, setShowRatingFeedback] = useState(false);

  const handleRatingSubmit = () => {
    if (homepageRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setShowRatingFeedback(true);
    toast.success('Thank you for your rating!');
  };

  return (
    <div className="bg-white">
      <main>
        {/* Welcome Section */}
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/sci.jpeg" 
              alt="Welcome to Bugema Hub" 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bugema-blue/90 to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h2 className="text-white text-3xl lg:text-5xl font-bold leading-tight uppercase">
                Welcome <br />
                <span className="text-bugema-accent">to Bugema Hub</span>
              </h2>
              <p className="text-blue-50 text-lg mt-4 max-w-xl font-medium leading-relaxed">
                Connecting students, faculty, and alumni in one powerful platform. 
                Manage your academic life, find opportunities, and join the conversation.
              </p>
              <div className="mt-8 flex gap-4">
                 <button 
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-white text-bugema-blue px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
                 >
                   Join Community
                 </button>
                 <Link 
                   href="/events"
                   className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95"
                 >
                   Explore Platform
                 </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-50/50 py-10 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { label: "Active Students", value: "5,000+" },
                { label: "Campus Events", value: "120+" },
                { label: "Student Clubs", value: "45+" },
                { label: "Opportunities", value: "300+" },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <p className="text-2xl lg:text-3xl font-black text-bugema-blue group-hover:scale-105 transition-transform duration-300">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section: Feature Categories Slideshow ── */}
        <FeatureSlideshow />

        {/* ── Section: Latest Updates ── */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-bugema-accent mb-3">Campus News</span>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                  Latest Updates
                </h2>
                <p className="mt-4 text-gray-500 text-base leading-relaxed">
                  Stay informed with the latest announcements, upcoming major events, and campus news.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  href="/events/news"
                  className="inline-flex items-center gap-2 text-sm font-bold text-bugema-blue hover:text-blue-800 transition-colors"
                >
                  View All News
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  category: "Announcement",
                  title: "Registration for Fall Semester 2026 Now Open",
                  date: "May 4, 2026",
                  desc: "Early registration is now available for returning students. Secure your classes before spots fill up.",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  image: "/assets/events/event-main.png"
                },
                {
                  category: "Event",
                  title: "Annual Tech Symposium & Hackathon",
                  date: "May 15-17, 2026",
                  desc: "Join us for 48 hours of coding, networking, and innovation. Prizes up to $5,000 for winning teams.",
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  image: "/assets/events/event-1.png"
                },
                {
                  category: "Campus",
                  title: "New Study Areas Opened in Main Library",
                  date: "May 2, 2026",
                  desc: "The library renovation is complete! Check out the newly added collaborative spaces on the 3rd floor.",
                  color: "text-green-600",
                  bg: "bg-green-50",
                  image: "/assets/events/event-2.png"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group flex flex-col bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.bg} ${item.color} uppercase tracking-wider shadow-sm`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-sm font-semibold text-gray-400 mb-2">{item.date}</p>
                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-bugema-blue transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                      {item.desc}
                    </p>
                    <Link
                      href="/events/news"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 group-hover:text-bugema-blue transition-colors mt-auto"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>        {/* ── Section: How It Works ── */}
        <section className="py-12 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-bugema-accent mb-3">Getting Started</span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900">How It Works</h2>
              <p className="mt-4 text-gray-500 max-w-md mx-auto text-base">
                Three simple steps to unlock the full Bugema Hub experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
              {/* connector line desktop */}
              <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gray-200 z-0" />

              {[
                {
                  step: "01",
                  icon: UserCheck,
                  title: "Create Your Account",
                  desc: "Sign up in seconds with your student email. Choose a plan that fits your campus needs.",
                },
                {
                  step: "02",
                  icon: Zap,
                  title: "Explore the Platform",
                  desc: "Browse events, join clubs, check the marketplace, and discover opportunities — all in one dashboard.",
                },
                {
                  step: "03",
                  icon: Sparkles,
                  title: "Connect & Grow",
                  desc: "Engage with your campus, earn badges, find mentors, and build your student profile.",
                },
              ].map((s, i) => {
                const StepIcon = s.icon;
                return (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-bugema-blue flex items-center justify-center shadow-lg shadow-bugema-blue/20 mb-6">
                      <StepIcon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs font-black text-bugema-accent uppercase tracking-widest mb-2">Step {s.step}</span>
                    <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ── Section: Experience Rating ── */}
        <section className="py-20 bg-gray-50 border-y border-gray-100 overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              {!showRatingFeedback ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl shadow-blue-900/5 border border-gray-100 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bugema-blue/5 text-bugema-blue text-xs font-black uppercase tracking-widest mb-6">
                    <Sparkles className="w-4 h-4" />
                    Quick Feedback
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                    How are we doing?
                  </h2>
                  <p className="text-gray-500 mb-10 max-w-md mx-auto">
                    Your quick rating helps us build a better digital campus for everyone.
                  </p>
                  
                  <div className="flex flex-col items-center gap-8">
                    <StarRating 
                      rating={homepageRating} 
                      setRating={setHomepageRating} 
                      size="lg" 
                    />
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRatingSubmit}
                      className="bg-bugema-blue text-white px-10 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
                    >
                      Submit Rating
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-12 shadow-2xl shadow-green-900/5 border border-gray-100 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Thank You!</h2>
                  <p className="text-gray-500 mb-8">
                    We appreciate your feedback. Want to provide more details?
                  </p>
                  <Link
                    href="/feedback"
                    className="inline-flex items-center gap-2 text-bugema-blue font-black uppercase tracking-widest hover:underline"
                  >
                    Go to Feedback Page
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* ── Section: CTA Banner ── */}
        <section className="py-16 bg-bugema-blue relative overflow-hidden">
          {/* decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-bugema-accent/10 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-center text-center gap-8"
            >
              <div>
                <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-bugema-accent mb-4">Ready to Begin?</span>
                <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight max-w-2xl">
                  Join thousands of students already on Bugema Hub
                </h2>
                <p className="mt-4 text-blue-200 text-lg max-w-lg mx-auto leading-relaxed">
                  Sign up for free and get instant access to events, clubs, opportunities, and your entire campus community.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-bugema-blue px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-gray-100 transition-all active:scale-95 shadow-xl text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started Free
                </button>
                <Link
                  href="/events"
                  className="flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white/10 transition-all active:scale-95 text-sm"
                >
                  Explore Events
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Signup Modal */}
      <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />
    </div>
  );
}


