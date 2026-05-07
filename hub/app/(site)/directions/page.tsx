'use client'

import { motion } from 'framer-motion'
import { MapPin, Bus, Car, Train, Navigation, Building2, BookOpen, Coffee, HelpCircle, Phone, ArrowUpRight } from 'lucide-react'

export default function DirectionsPage() {
  const landmarks = [
    {
      category: 'Academic',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      sites: ['Main Library', 'Science Complex', 'School of Business', 'Education Block']
    },
    {
      category: 'Administration',
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      sites: ['Main Administration Block', 'Admissions Office', 'Finance Department', 'Post Office']
    },
    {
      category: 'Student Welfare',
      icon: Coffee,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      sites: ['University Health Center', 'Student Center (Dining)', 'Enoc Hall', 'Guest House']
    }
  ]

  const travelGuides = [
    {
      method: 'Public Transport',
      icon: Bus,
      route: 'From Kampala (Old/New Taxi Park)',
      description: 'Take a taxi heading to Ziroobwe or Bamunanika. Ask to be dropped off at the Bugema University Main Gate.'
    },
    {
      method: 'Private Vehicle',
      icon: Car,
      route: 'Gayaza-Ziroobwe Road',
      description: 'Drive along Gayaza Road, through Gayaza trading center, continue towards Ziroobwe. The university is clearly signposted.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="relative h-64 bg-bugema-blue overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mt-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white text-sm">
              <MapPin className="w-4 h-4" />
              <span>Luwero District, Uganda</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Campus Directions <span className="text-blue-300">&</span> Map
            </h1>
            <p className="text-white/80 text-lg max-w-2xl font-medium">
              Your comprehensive guide to navigating Bugema University's lush 640-acre campus. 
              Find your way to lectures, residences, and iconic landmarks.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Map Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stylized Campus Map Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase">Campus Map Overview</h3>
                  <p className="text-sm text-gray-500">Stylized 360° architectural view of Bugema University</p>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                     <Download className="w-5 h-5 text-gray-600" />
                   </button>
                </div>
              </div>
              <div className="relative aspect-[16/9] w-full">
                <img 
                  src="/assets/images/university/campus_map.png" 
                  alt="Stylized Bugema campus map" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Interactive Google Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden"
            >
              <div className="p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Interactive Navigation</span>
                </div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Bugema+University" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-bugema-blue text-xs font-bold flex items-center hover:underline"
                  >
                    GOOGLE MAPS <ArrowUpRight className="ml-1 w-3 h-3" />
                  </a>
                  <a 
                    href="https://maps.apple.com/?q=Bugema+University" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-bugema-blue text-xs font-bold flex items-center hover:underline"
                  >
                    APPLE MAPS <ArrowUpRight className="ml-1 w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="h-[450px] w-full">
                <iframe
                  title="Bugema University Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1d3989.511111111111!2d32.641944!3d0.569722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177da3b8d1b60f3b%3A0xb3b2f6eaf7a8b!2sBugema%20University!5e0!3m2!1sen!2sug!4v1620000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-b-3xl"
                />
              </div>
            </motion.div>

            {/* Landmarks Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center">
                <Navigation className="mr-3 text-bugema-blue" />
                Campus Landmarks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {landmarks.map((item, idx) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{item.category}</h3>
                    <ul className="space-y-2">
                      {item.sites.map(site => (
                        <li key={site} className="text-gray-500 text-sm flex items-center group">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2 group-hover:bg-bugema-blue transition-colors" />
                          {site}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Directions & Transport */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-bugema-blue/5 rounded-full -mr-16 -mt-16" />
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">How to get here</h3>
              
              <div className="space-y-8">
                {travelGuides.map((guide, idx) => (
                  <div key={guide.method} className="relative">
                    <div className="flex items-center space-x-3 mb-2">
                       <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                         <guide.icon className="w-4 h-4 text-bugema-blue" />
                       </div>
                       <span className="font-bold text-sm text-gray-900">{guide.method}</span>
                    </div>
                    <p className="text-xs font-black text-bugema-blue uppercase mb-1">{guide.route}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-red-600 mb-4">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Emergency Contacts</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Security Hotline</span>
                    <span className="font-bold text-gray-900">+256 701 000 000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Ambulance</span>
                    <span className="font-bold text-gray-900">+256 702 111 222</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <HelpCircle className="w-5 h-5 text-blue-200" />
                <h3 className="text-lg font-bold">Visitor Tips</h3>
              </div>
              <ul className="space-y-4 text-sm text-white/90">
                <li className="flex items-start pair">
                  <span className="mr-2">💡</span>
                  <span>Parking is available at the Main Gate and Faculty buildings.</span>
                </li>
                <li className="flex items-start pair">
                  <span className="mr-2">💡</span>
                  <span>The campus is highly pedestrian-friendly; wear comfortable shoes.</span>
                </li>
                <li className="flex items-start pair">
                  <span className="mr-2">💡</span>
                  <span>Visitors are required to register at the main security check-point.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}



