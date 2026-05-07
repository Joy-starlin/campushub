"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Slide data ────────────────────────────────────────────────── */
const slides = [
  {
    id: "events",
    title: "Events",
    subtitle: "Never miss what matters",
    desc: "Discover and RSVP to campus events and live countdowns. Stay in the loop every single day.",
    image: "/slides/events.jpg",
    placeholder: "from-blue-50 to-blue-100",
    links: [
      { label: "All Events",     href: "/events" },
      { label: "News Feed",      href: "/events/news" },
    ],
  },
  {
    id: "clubs",
    title: "Clubs",
    subtitle: "Find your people",
    desc: "Join student clubs, participate in live chats, and collaborate in study groups — your campus community awaits.",
    image: "/slides/clubs.jpg",
    placeholder: "from-purple-50 to-purple-100",
    links: [
      { label: "Club Directory", href: "/clubs" },
      { label: "Live Chat",      href: "/clubs/chat" },
      { label: "Study Groups",   href: "/study-groups" },
    ],
  },
  {
    id: "community",
    title: "Community",
    subtitle: "Campus life, simplified",
    desc: "Buy & sell on the marketplace, share rides, report lost items, and access PDF resources — all in one place.",
    image: "/slides/community.jpg",
    placeholder: "from-green-50 to-green-100",
    links: [
      { label: "Marketplace",  href: "/marketplace" },
      { label: "Ride Sharing", href: "/rides" },
      { label: "Lost & Found", href: "/lost-found" },
    ],
  },
  {
    id: "global",
    title: "Global",
    subtitle: "Beyond the campus gates",
    desc: "Explore internships, connect with alumni, discover universities worldwide, and find the mentors who inspire you.",
    image: "/slides/global.jpg",
    placeholder: "from-orange-50 to-orange-100",
    links: [
      { label: "Jobs & Internships", href: "/jobs" },
      { label: "Alumni Network",     href: "/alumni" },
      { label: "Mentorship",         href: "/mentorship" },
    ],
  },
  {
    id: "engage",
    title: "Engage",
    subtitle: "Grow with every interaction",
    desc: "Earn badges, climb the leaderboard, track achievements, and get verified — your effort deserves recognition.",
    image: "/slides/engage.jpg",
    placeholder: "from-yellow-50 to-yellow-100",
    links: [
      { label: "Leaderboard",   href: "/leaderboard" },
      { label: "Badges",        href: "/badges" },
      { label: "Notifications", href: "/notifications" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback & More",
    subtitle: "Your voice, your campus",
    desc: "Submit anonymous feedback, navigate with campus directions, and browse shared resources — transparency starts here.",
    image: "/slides/feedback.jpg",
    placeholder: "from-sky-50 to-sky-100",
    links: [
      { label: "Anonymous Feedback", href: "/feedback" },
      { label: "Directions & Map",   href: "/directions" },
      { label: "PDF Resources",      href: "/resources" },
    ],
  },
];

const AUTOPLAY_MS = 5000;

/* ─── Component ─────────────────────────────────────────────────── */
export default function FeatureSlideshow() {
  const [current, setCurrent]       = useState(0);
  const [direction, setDirection]   = useState(1);
  const [paused, setPaused]         = useState(false);
  // Track which slide images have failed to load
  const [imgErrors, setImgErrors]   = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(current + 1,  1),  [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  /* Auto-advance */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, next]);

  const slide      = slides[current];
  const hasImage   = !imgErrors.has(slide.id);

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-bugema-accent mb-3">
            What We Offer
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
            Everything campus life needs,<br />
            <span className="text-bugema-blue">in one place</span>
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            Bugema Hub brings every corner of university life into a single, beautifully connected platform.
          </p>
        </motion.div>

        {/* ── Slideshow card ── */}
        <div
          className="relative overflow-hidden rounded-3xl shadow-sm bg-white"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px] lg:min-h-[480px]"
            >
              {/* ── Left: image / placeholder ── */}
              <div className={`relative w-full h-64 sm:h-80 lg:h-full overflow-hidden bg-gradient-to-br ${slide.placeholder}`}>
                {hasImage && (
                  <Image
                    key={slide.id}
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    onError={() =>
                      setImgErrors(prev => new Set(prev).add(slide.id))
                    }
                  />
                )}

                {/* Placeholder — always rendered, hidden once image loads */}
                {!hasImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-28 h-28 rounded-3xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <span className="text-5xl font-black text-gray-300 select-none leading-none">
                        {slide.title.charAt(0)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Image coming soon
                    </span>
                  </div>
                )}

                {/* Slide number badge */}
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-black text-gray-500 uppercase tracking-widest">
                  {current + 1} / {slides.length}
                </div>
              </div>

              {/* ── Right: content ── */}
              <div className="flex flex-col justify-center px-8 py-10 lg:px-14 lg:py-16 bg-white">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-bugema-accent mb-3">
                  {slide.subtitle}
                </span>
                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
                  {slide.title}
                </h3>
                <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-sm">
                  {slide.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slide.links.map((lnk) => (
                    <Link
                      key={lnk.label}
                      href={lnk.href}
                      className="text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-bugema-blue hover:text-white rounded-full px-4 py-2 transition-all duration-200"
                    >
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Prev / Next arrows ── */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>


        </div>

        {/* ── Dot indicators ── */}
        <div className="flex items-center justify-center gap-2.5 mt-6">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to ${s.title}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2.5 bg-bugema-blue"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* ── Slide title labels ── */}
        <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200 ${
                i === current
                  ? "bg-bugema-blue text-white"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
