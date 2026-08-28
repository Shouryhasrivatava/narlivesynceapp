import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const HeroBanner = ({ featuredPost, onSelectPost }) => {
  if (!featuredPost) return null;

  return (
    <div className="relative mb-8 overflow-hidden border-4 border-spidey-black bg-spidey-yellow shadow-comic-lg">
      {/* Halftone Overlay */}
      <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" />

      {/* Vintage Top Sub-Header Strip (From Daily Bugle Reference Photo) */}
      <div className="bg-spidey-black text-white px-4 py-1 flex flex-wrap items-center justify-between text-[11px] font-sans font-bold border-b-3 border-black">
        <div className="flex items-center gap-3">
          <span className="text-spidey-yellow font-headline tracking-widest uppercase">
            ★ SPIDER-MAN: HERO OR MENACE?
          </span>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-gray-300">SUBWAY CRASH VICTIMS SAVED BY COSTUMED FIGURE</span>
        </div>
        <div className="text-spidey-red font-headline tracking-wide uppercase">
          PAGE 2 BULLETIN
        </div>
      </div>

      {/* Decorative Starburst Stamp */}
      <div className="absolute -top-4 -right-4 w-28 h-28 bg-spidey-red text-white flex items-center justify-center font-headline text-xl border-4 border-black transform rotate-12 shadow-comic pointer-events-none hidden md:flex z-20">
        <div className="text-center transform -rotate-12">
          <p className="text-2xl font-black leading-none">HOT</p>
          <p className="text-xs tracking-widest text-spidey-yellow">SCOOP!</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
        {/* Cover Art with 3D Tilt Comic Frame */}
        <motion.div
          whileHover={{ scale: 1.03, rotate: -1.5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="lg:col-span-5 relative cursor-pointer"
          onClick={() => {
            soundFx.playPow();
            onSelectPost(featuredPost);
          }}
        >
          <div className="relative border-4 border-spidey-black shadow-comic-lg bg-black overflow-hidden group">
            <img
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              className="w-full h-64 sm:h-76 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 bg-spidey-red text-white font-headline tracking-widest text-sm px-3 py-1 border-2 border-black shadow-comic-sm">
              {featuredPost.soundEffect || 'THWIP!'}
            </div>
            <div className="absolute bottom-3 right-3 bg-spidey-black/90 text-white font-comic text-xs px-2.5 py-1 border border-white">
              CLICK TO OPEN CHRONICLE
            </div>
          </div>
        </motion.div>

        {/* Content Details */}
        <div className="lg:col-span-7 flex flex-col items-start">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-spidey-black text-spidey-yellow font-headline tracking-widest text-xs px-2.5 py-0.5 border-2 border-black uppercase">
              ★ FRONT PAGE SCOOP
            </span>
            <span className="bg-white text-spidey-black font-sans font-black text-xs px-2.5 py-0.5 border-2 border-black uppercase">
              {featuredPost.category}
            </span>
          </div>

          <h2
            onClick={() => {
              soundFx.playPow();
              onSelectPost(featuredPost);
            }}
            className="font-headline text-3xl sm:text-4xl lg:text-5xl text-spidey-black leading-tight uppercase cursor-pointer hover:text-spidey-red transition-colors mb-3"
          >
            {featuredPost.title}
          </h2>

          <p className="font-comic text-base sm:text-lg text-gray-900 leading-relaxed mb-4 bg-white/80 p-3 border-2 border-black">
            "{featuredPost.excerpt}"
          </p>

          {/* Author and Engagement Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 w-full pt-2 border-t-2 border-black">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{featuredPost.authorAvatar || '🕷️'}</span>
              <div>
                <p className="font-headline tracking-wide text-sm leading-none text-spidey-black">
                  BY {featuredPost.author}
                </p>
                <p className="font-sans text-xs text-gray-700 font-bold">
                  {featuredPost.authorRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-headline text-sm bg-white px-2.5 py-1 border-2 border-black">
                <Heart className="w-4 h-4 text-spidey-red fill-spidey-red" />
                <span>{featuredPost.likes || 0} CLAPS</span>
              </div>
              <div className="flex items-center gap-1.5 font-headline text-sm bg-white px-2.5 py-1 border-2 border-black">
                <MessageSquare className="w-4 h-4 text-spidey-blue" />
                <span>{featuredPost.comments?.length || 0} BUBBLES</span>
              </div>
              <button
                onClick={() => {
                  soundFx.playThwip();
                  onSelectPost(featuredPost);
                }}
                className="flex items-center gap-1 px-4 py-1.5 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-sm border-2 border-black shadow-comic-sm comic-button"
              >
                <span>READ ISSUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
