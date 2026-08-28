import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Edit3, Trash2, Tag, ArrowUpRight } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ActionWordBadge } from './ActionBubble';

export const PostCard = ({
  post,
  viewMode = 'grid',
  currentUser = null,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onLikePost,
  onSpawnParticle
}) => {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    soundFx.playThwip();
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 400);

    // Spawn floating particle at click coordinate
    if (onSpawnParticle) {
      const rect = e.currentTarget.getBoundingClientRect();
      onSpawnParticle(rect.left + rect.width / 2, rect.top, post.soundEffect || 'THWIP!');
    }

    onLikePost(post.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    soundFx.playPop();
    onEditPost(post);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    soundFx.playKrash();
    onDeletePost(post);
  };

  const isStaff = currentUser && !currentUser.isGuest;

  // Category Color Map
  const categoryColors = {
    Scoop: 'bg-spidey-yellow text-spidey-black',
    'Hero Log': 'bg-spidey-red text-white',
    'Villain Alert': 'bg-spidey-black text-spidey-yellow',
    'Tech & Gear': 'bg-spidey-blue text-white',
    Multiverse: 'bg-purple-600 text-white'
  };

  const badgeColor = categoryColors[post.category] || 'bg-spidey-yellow text-spidey-black';

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ x: 4 }}
        onClick={() => {
          soundFx.playPow();
          onSelectPost(post);
        }}
        className="group relative bg-white border-3 border-spidey-black shadow-comic-sm hover:shadow-comic transition-all cursor-pointer p-4 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-black flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] font-headline tracking-widest px-2 py-0.2 border border-black uppercase ${badgeColor}`}>
                {post.category}
              </span>
              <span className="text-xs text-gray-500 font-bold font-sans">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl text-spidey-black uppercase truncate group-hover:text-spidey-red transition-colors">
              {post.title}
            </h3>
            <p className="font-comic text-xs sm:text-sm text-gray-700 truncate max-w-xl">
              {post.excerpt || post.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-yellow-50 font-headline text-xs border-2 border-black shadow-comic-sm"
          >
            <Heart className={`w-3.5 h-3.5 ${post.likes > 0 ? 'text-spidey-red fill-spidey-red' : 'text-gray-500'} ${isLiking ? 'scale-125' : ''}`} />
            <span>{post.likes || 0}</span>
          </button>
          <div className="flex items-center gap-1 font-headline text-xs px-2 py-1 bg-gray-100 border border-black">
            <MessageSquare className="w-3.5 h-3.5 text-spidey-blue" />
            <span>{post.comments?.length || 0}</span>
          </div>
          {isStaff && (
            <>
              <button
                onClick={handleEdit}
                title="Edit Issue"
                className="p-1.5 bg-yellow-100 hover:bg-yellow-200 border-2 border-black"
              >
                <Edit3 className="w-3.5 h-3.5 text-black" />
              </button>
              <button
                onClick={handleDelete}
                title="Delete Issue"
                className="p-1.5 bg-red-100 hover:bg-red-200 border-2 border-black text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Grid Comic Panel View
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, rotate: -0.5 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onClick={() => {
        soundFx.playPow();
        onSelectPost(post);
      }}
      className="group relative bg-white border-4 border-spidey-black shadow-comic hover:shadow-comic-lg transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Sound Word Badge in Corner */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <ActionWordBadge text={post.soundEffect || 'THWIP!'} angle={6} />
      </div>

      {/* Image Thumbnail Container */}
      <div className="relative h-48 sm:h-52 overflow-hidden border-b-4 border-spidey-black bg-gray-900">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Halftone Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        <div className="absolute bottom-2 left-3">
          <span className={`font-headline tracking-widest text-xs px-2.5 py-0.5 border-2 border-black uppercase shadow-comic-sm ${badgeColor}`}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-headline text-xl sm:text-2xl text-spidey-black uppercase leading-tight mb-2 group-hover:text-spidey-red transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="font-comic text-sm text-gray-800 line-clamp-3 mb-4 leading-relaxed">
            {post.excerpt || post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-sans font-bold bg-spidey-paper border border-black px-1.5 py-0.5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer: Author & Actions */}
        <div className="pt-3 border-t-2 border-black flex items-center justify-between gap-2">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{post.authorAvatar || '🕷️'}</span>
            <div className="truncate">
              <p className="font-headline text-xs uppercase text-spidey-black truncate leading-none">
                {post.author}
              </p>
              <p className="font-sans text-[10px] text-gray-600 font-bold">
                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Clap / Like */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1 font-headline text-xs border-2 border-black shadow-comic-sm transition-colors ${
                post.likes > 0 ? 'bg-yellow-100 text-spidey-black' : 'bg-white hover:bg-yellow-50'
              }`}
              title="Give Hero Clap"
            >
              <Heart className={`w-3.5 h-3.5 ${post.likes > 0 ? 'text-spidey-red fill-spidey-red' : 'text-gray-500'}`} />
              <span>{post.likes || 0}</span>
            </motion.button>

            {/* Comments Counter */}
            <div className="flex items-center gap-1 font-headline text-xs px-1.5 py-1 bg-white border border-black" title="Speech Bubble Comments">
              <MessageSquare className="w-3.5 h-3.5 text-spidey-blue" />
              <span>{post.comments?.length || 0}</span>
            </div>

            {/* Edit & Delete (Staff Only) */}
            {isStaff && (
              <>
                <button
                  onClick={handleEdit}
                  title="Edit Issue"
                  className="p-1.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black text-black"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleDelete}
                  title="Delete Issue"
                  className="p-1.5 bg-red-500 hover:bg-red-600 border-2 border-black text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
