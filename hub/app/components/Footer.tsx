"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  ChevronUp,
  Heart
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebookF, 
  faTwitter, 
  faYoutube, 
  faInstagram, 
  faLinkedinIn 
} from "@fortawesome/free-brands-svg-icons";

const footerLinks = [
  {
    title: "About Bugema Hub",
    links: [
      { name: "Our Mission", href: "/about" },
      { name: "Leadership", href: "/leadership" },
      { name: "Newsroom", href: "/news" },
      { name: "Contact Us", href: "/contact" },
      { name: "Careers", href: "/jobs" },
    ]
  },
  {
    title: "Student Life",
    links: [
      { name: "Clubs & Societies", href: "/clubs" },
      { name: "Events Calendar", href: "/events" },
      { name: "Study Groups", href: "/study-groups" },
      { name: "Mentorship", href: "/mentorship" },
      { name: "Lost & Found", href: "/lost-found" },
    ]
  },
  {
    title: "Help & Support",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Use", href: "/terms" },
      { name: "Emergency Info", href: "/emergency" },
      { name: "Library Services", href: "/library" },
      { name: "ICT Support", href: "/ict-support" },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Marketplace", href: "/marketplace" },
      { name: "Alumni Network", href: "/alumni" },
      { name: "Ride Sharing", href: "/rides" },
      { name: "PDF Resources", href: "/resources" },
      { name: "Virtual Tour", href: "/tour" },
    ]
  }
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#001A33] text-white pt-12 pb-6">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Top Section - Bentley Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          {/* Brand & Address */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-white">BUGEMA HUB</span>
            </div>
            <div className="space-y-3 text-gray-400 text-sm">
              <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-blue-400" /> Bugema University Campus, Main Road</p>
              <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-400" /> support@bugemahub.com</p>
              <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-400" /> +256 781 000 000</p>
            </div>
          </div>

          {/* Socials */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Follow Us:</h3>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: faFacebookF, name: "Facebook" },
                { icon: faTwitter, name: "Twitter" },
                { icon: faYoutube, name: "YouTube" },
                { icon: faInstagram, name: "Instagram" },
                { icon: faLinkedinIn, name: "LinkedIn" }
              ].map((social, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-bugema-blue transition-all border border-white/10 group-hover:scale-110">
                    <FontAwesomeIcon icon={social.icon} className="w-5 h-5 text-white" />
                  </a>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-bugema-blue transition-colors">{social.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Button */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Support Us:</h3>
            <button className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 transition-colors shadow-xl text-white">
              Make a Gift
            </button>
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Work with us:</h3>
            <Link href="/jobs" className="flex items-center gap-2 text-sm font-semibold hover:text-bugema-blue transition-colors group">
              View Open Jobs <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-10" />

        {/* Middle Section - Sephora Style Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-lg font-bold mb-6 text-white">{group.title}</h3>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom Section - Sephora Newsletter & Copyright */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-8">
          {/* Newsletter */}
          <div className="w-full lg:w-auto">
            <p className="text-sm font-bold mb-4 uppercase tracking-[0.2em] text-white">Subscribe for Bugema Hub News</p>
            <form className="flex max-w-md shadow-2xl">
              <input 
                type="email" 
                placeholder="Enter Email Address" 
                className="flex-1 bg-white/5 border border-white/20 rounded-l-xl px-4 py-3 text-sm focus:outline-none focus:border-bugema-blue transition-colors text-white"
              />
              <button className="bg-bugema-blue px-8 py-3 rounded-r-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors text-white">
                Subscribe
              </button>
            </form>
          </div>

          {/* Back to Top */}
          <button 
            onClick={scrollToTop}
            className="flex flex-col items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center">
              <ChevronUp className="w-5 h-5" />
            </div>
            Top
          </button>
        </div>

        {/* Copyright Line */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-[11px] text-gray-500 uppercase tracking-[0.2em] font-medium gap-4">
          <p>© 2026 Bugema Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
          <p className="flex items-center gap-1">Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the Campus</p>
        </div>
      </div>
    </footer>
  );
}
