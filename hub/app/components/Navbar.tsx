"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Home,
  Calendar,
  Users,
  Briefcase,
  Trophy,
  Bell,
  Search,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  MessageSquare,
  BookOpen,
  SearchCheck,
  School,
  ShoppingBag,
  MapPin,
  Globe,
  Rss,
  CalendarDays,
  Video,
  MessageCircle,
  Car,
  FileText,
  GraduationCap,
  HandHeart,
  BarChart3,
  Medal,
  CheckCircle,
  LayoutDashboard,
  ShieldAlert,
  FileJson,
  Mic,
  ScanLine,
  Sparkles
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import SignupModal from "./SignupModal";


const mainNavItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Events",
    icon: Calendar,
    dropdown: [
      { name: "News Feed", href: "/events/news", icon: Rss },
      { name: "All Events", href: "/events", icon: CalendarDays },
      { name: "Virtual Events", href: "/events/virtual", icon: Video },
      { name: "Countdown", href: "/events/countdown", icon: Sparkles },
    ]
  },
  {
    name: "Clubs",
    icon: Users,
    dropdown: [
      { name: "Club Directory", href: "/clubs", icon: Users },
      { name: "Club Live Chat", href: "/clubs/chat", icon: MessageCircle },
      { name: "Study Groups", href: "/study-groups", icon: BookOpen },
      { name: "Create a Club", href: "/clubs/create", icon: Sparkles },
    ]
  },
  {
    name: "Community",
    icon: Users,
    dropdown: [
      { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
      { name: "Lost & Found", href: "/lost-found", icon: SearchCheck },
      { name: "Ride Sharing", href: "/rides", icon: Car },
      { name: "Directions & Map", href: "/directions", icon: MapPin },
      { name: "Anonymous Feedback", href: "/feedback", icon: MessageSquare },
      { name: "PDF Resources", href: "/resources", icon: FileText },
    ]
  },
  {
    name: "Global",
    icon: Globe,
    dropdown: [
      { name: "Jobs & Internships", href: "/jobs", icon: Briefcase },
      { name: "Alumni Network", href: "/alumni", icon: GraduationCap },
      { name: "Universities", href: "/universities", icon: School },
      { name: "Mentorship", href: "/mentorship", icon: HandHeart },
    ]
  },
  {
    name: "Engage",
    icon: Trophy,
    dropdown: [
      { name: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
      { name: "Badges & Achievements", href: "/badges", icon: Medal },
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Verified Badges", href: "/verified-badges", icon: CheckCircle },
    ]
  }
];

const bottomNavLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Clubs", href: "/clubs", icon: Users },
  { name: "Global", href: "/jobs", icon: Globe },
  { name: "Profile", href: "/profile", icon: User },
];

const languages = [
  { code: "EN", value: "en", name: "English" },
  { code: "FR", value: "fr", name: "Français" },
  { code: "SW", value: "sw", name: "Kiswahili" },
  { code: "ES", value: "es", name: "Español" },
  { code: "DE", value: "de", name: "Deutsch" },
  { code: "AR", value: "ar", name: "العربية" },
  { code: "ZH", value: "zh-CN", name: "中文" },
  { code: "PT", value: "pt", name: "Português" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut: logout } = useAuth();
  const { unreadCount } = useNotifications();
  const isLoggedIn = !!user;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin'; // Assuming role is provided


  useEffect(() => {
    // Read the googtrans cookie on mount to set initial language
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
      if (match) {
        const parts = decodeURIComponent(match[1]).split('/');
        if (parts.length > 2) {
          const langValue = parts[2];
          const foundLang = languages.find(l => l.value === langValue);
          if (foundLang) {
            setCurrentLanguage(foundLang.code);
          }
        }
      }
    }
  }, []);

  const handleLanguageChange = (langCode: string, langValue: string) => {
    setCurrentLanguage(langCode);
    setIsLanguageOpen(false);
    
    // Set cookie for auto-translation
    document.cookie = `googtrans=/en/${langValue}; path=/`;
    document.cookie = `googtrans=/en/${langValue}; domain=${window.location.hostname}; path=/`;
    
    // Trigger the Google Translate dropdown directly for instant translation
    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectEl) {
      selectEl.value = langValue;
      selectEl.dispatchEvent(new Event('change'));
    } else {
      // Fallback if widget is not fully loaded
      window.location.reload();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice search is not supported in your browser.');
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLanguage === 'EN' ? 'en-US' : currentLanguage.toLowerCase();

    recognition.onstart = () => {
      setIsListening(true);
      toast('Listening...', { icon: '🎙️', duration: 3000 });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Heard: "${transcript}"`);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error('Could not hear you properly.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Image selected: ${file.name}`);
      // Mock navigation for visual search
      router.push(`/search?image_search=true&filename=${encodeURIComponent(file.name)}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setIsProfileOpen(false);
    setIsLanguageOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}>
      {/* Top Header */}
      <div className="">
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 relative">
            {/* Left Corner: Logo & Title */}
            <div className="flex-shrink-0 z-10">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative h-12 w-auto min-w-[3rem] transition-transform duration-300 group-hover:scale-105">
                  <Image 
                    src="/logo.png" 
                    alt="Bugema Hub Logo" 
                    width={48} 
                    height={48} 
                    className="h-full w-auto object-contain" 
                    priority
                  />
                </div>
                <span className="text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-black text-bugema-blue tracking-[-0.05em] uppercase leading-none select-none">
                  BUGEMA HUB
                </span>
              </Link>
            </div>

            {/* Search Bar - Absolutely Centered */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-xl lg:max-w-2xl px-4 pointer-events-none">
              <div className="w-full pointer-events-auto">
                <form 
                  onSubmit={handleSearch} 
                  className="relative w-full flex items-center bg-white border border-gray-200 rounded-full py-1.5 pl-4 pr-1.5 focus-within:shadow-md focus-within:border-bugema-blue/30 transition-all shadow-sm"
                >
                  <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, clubs, jobs..."
                    className="w-full bg-transparent border-none focus:outline-none text-gray-700 text-[15px] placeholder-gray-500"
                  />
                  
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery("")}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors flex-shrink-0"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button 
                      type="button" 
                      onClick={startVoiceSearch}
                      className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-700 hover:bg-gray-100'}`} 
                      title="Voice Search"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload}
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center" 
                      title="Image Search"
                    >
                      <ScanLine className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 md:gap-4 z-10">
              {/* Language Selector */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-bugema-blue p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span>{currentLanguage}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-36 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50"
                    >
                      <div className="space-y-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              handleLanguageChange(lang.code, lang.value);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                              currentLanguage === lang.code
                                ? "bg-bugema-blue/10 text-bugema-blue font-bold"
                                : "text-gray-700 hover:bg-gray-50 hover:text-bugema-blue"
                            }`}
                          >
                            <span>{lang.code}</span>
                            <span className="text-xs text-gray-500 font-normal">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-bugema-blue transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Actions */}
              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-200 overflow-hidden"
                    >
                      {user?.photoURL ? (
                        <Image src={user.photoURL} alt="Profile" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50"
                        >
                          <div className="px-3 py-3 border-b border-gray-100 mb-2">
                            <p className="text-sm font-bold text-gray-900">{user?.displayName || "User"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Student Account</p>
                          </div>
                          
                          <div className="space-y-1 mb-2">
                            <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-bugema-blue transition-colors">
                              <User className="w-4 h-4" /> My Profile
                            </Link>
                            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-bugema-blue transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                            <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-bugema-blue transition-colors">
                              <Settings className="w-4 h-4" /> Settings & Privacy
                            </Link>
                          </div>

                          {isAdmin && (
                             <div className="space-y-1 mb-2 border-t border-gray-100 pt-2">
                               <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
                               <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-bugema-blue transition-colors">
                                 <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                               </Link>
                             </div>
                          )}
                          
                          <div className="border-t border-gray-100 pt-2">
                            <button
                              onClick={logout}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/auth/login"
                      className="hidden md:block text-sm font-bold text-gray-600 hover:text-bugema-blue transition-colors px-2"
                    >
                      SignIn
                    </Link>
                    <button
                      onClick={() => setIsSignupModalOpen(true)}
                      className="px-6 py-2 bg-bugema-blue text-white rounded-full text-sm font-black hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 uppercase tracking-wide"
                    >
                      SignUp
                    </button>

                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-bugema-blue transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar - Desktop Only */}
      <nav className="hidden lg:block bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center h-14 gap-8">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const hasDropdown = !!item.dropdown;
              const active = item.href ? pathname === item.href : item.dropdown?.some(d => pathname === d.href);
              
              return (
                <li 
                  key={item.name} 
                  className="h-full relative group"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
                >
                  {hasDropdown ? (
                    <button
                      className={`flex items-center gap-2 h-full px-1 text-sm font-semibold transition-all relative ${
                        active || activeDropdown === item.name ? "text-bugema-blue" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active || activeDropdown === item.name ? "text-bugema-blue" : "text-gray-400"}`} />
                      {item.name}
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.name ? "rotate-180 text-bugema-blue" : "text-gray-400"}`} />
                      {(active || activeDropdown === item.name) && (
                        <motion.div
                          layoutId="navUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-bugema-blue"
                        />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-2 h-full px-1 text-sm font-semibold transition-all relative ${
                        active ? "text-bugema-blue" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-bugema-blue" : "text-gray-400"}`} />
                      {item.name}
                      {active && (
                        <motion.div
                          layoutId="navUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-bugema-blue"
                        />
                      )}
                    </Link>
                  )}

                  {/* Desktop Dropdown Menu */}
                  {hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-full mt-0 w-64 pt-2 pb-4 z-50"
                        >
                          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Icon className="w-4 h-4 text-bugema-blue" />
                                {item.name}
                              </h3>
                            </div>
                            <ul className="py-2 px-2">
                              {item.dropdown!.map((dropItem) => {
                                const DropIcon = dropItem.icon;
                                const isDropActive = pathname === dropItem.href;
                                return (
                                  <li key={dropItem.name}>
                                    <Link
                                      href={dropItem.href}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                        isDropActive
                                          ? "bg-bugema-blue/5 text-bugema-blue font-semibold"
                                          : "text-gray-600 hover:bg-gray-50 hover:text-bugema-blue"
                                      }`}
                                    >
                                      <DropIcon className={`w-4 h-4 ${isDropActive ? "text-bugema-blue" : "text-gray-400"}`} />
                                      {dropItem.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white z-50 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="relative h-10 w-auto min-w-[2.5rem]">
                    <Image 
                      src="/logo.png" 
                      alt="Bugema Hub Logo" 
                      width={40} 
                      height={40} 
                      className="h-full w-auto object-contain" 
                    />
                  </div>
                  <span className="font-black text-xl text-bugema-blue">BUGEMA HUB</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-3 space-y-1">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const hasDropdown = !!item.dropdown;
                    const isExpanded = mobileExpanded === item.name;
                    
                    if (!hasDropdown) {
                      return (
                        <Link
                          key={item.name}
                          href={item.href!}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                            pathname === item.href ? "bg-bugema-blue/10 text-bugema-blue font-bold" : "text-gray-700 font-semibold hover:bg-gray-50"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${pathname === item.href ? "text-bugema-blue" : "text-gray-400"}`} />
                          {item.name}
                        </Link>
                      );
                    }

                    return (
                      <div key={item.name} className="flex flex-col">
                        <button
                          onClick={() => setMobileExpanded(isExpanded ? null : item.name)}
                          className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                            isExpanded ? "bg-gray-50 text-bugema-blue font-bold" : "text-gray-700 font-semibold hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${isExpanded ? "text-bugema-blue" : "text-gray-400"}`} />
                            {item.name}
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-bugema-blue" : "text-gray-400"}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-12 pr-4 py-2 space-y-1">
                                {item.dropdown!.map((dropItem) => {
                                  const DropIcon = dropItem.icon;
                                  return (
                                    <Link
                                      key={dropItem.name}
                                      href={dropItem.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className={`flex items-center gap-3 py-2.5 text-sm transition-colors ${
                                        pathname === dropItem.href ? "text-bugema-blue font-bold" : "text-gray-600 hover:text-bugema-blue font-medium"
                                      }`}
                                    >
                                      <DropIcon className={`w-4 h-4 ${pathname === dropItem.href ? "text-bugema-blue" : "text-gray-400"}`} />
                                      {dropItem.name}
                                    </Link>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="w-10 h-10 bg-bugema-blue/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-bugema-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user?.displayName || "Student"}</p>
                        <p className="text-xs text-gray-500">View Profile</p>
                      </div>
                    </div>
                    <button onClick={logout} className="w-full py-3 mt-2 text-red-600 font-semibold text-center bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-3 text-bugema-blue text-center font-bold rounded-xl border-2 border-bugema-blue hover:bg-bugema-blue/5 transition-colors"
                    >
                      SignIn
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsSignupModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-bugema-blue text-white text-center font-black rounded-xl shadow-lg shadow-bugema-blue/20 hover:bg-blue-700 transition-colors uppercase tracking-wide"
                    >
                      SignUp
                    </button>

                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation - Visible only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <ul className="flex items-center justify-around h-16 px-1">
          {bottomNavLinks.filter(link => link.name !== 'Profile' || isLoggedIn).map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <li key={link.name} className="h-full flex-1">
                <Link
                  href={link.href}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${
                    active ? "text-bugema-blue" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-bugema-blue" : "text-gray-400"}`} />
                  <span className="text-[10px] font-bold tracking-tight">{link.name}</span>
                  {active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-bugema-blue rounded-b-full"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Signup Modal */}
      <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />
    </header>
  );
}

