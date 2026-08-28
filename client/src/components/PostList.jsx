import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from './PostCard';
import { soundFx } from '../utils/audio';
import { PlusCircle, SearchX } from 'lucide-react';

export const PostList = ({
  posts,
  loading,
  viewMode,
  currentUser = null,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onLikePost,
  onSpawnParticle,
  onOpenCreateModal
}) => {
  if (loading) {
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="border-4 border-spidey-black bg-white p-4 h-80 animate-pulse flex flex-col justify-between shadow-comic"
          >
            <div className="bg-gray-300 h-44 border-2 border-black mb-3" />
            <div className="space-y-2">
              <div className="bg-gray-300 h-6 w-3/4 border border-black" />
              <div className="bg-gray-200 h-4 w-full" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-black">
              <div className="bg-gray-300 h-6 w-24" />
              <div className="bg-gray-300 h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 sm:p-12 text-center bg-white border-4 border-spidey-black shadow-comic-lg my-6 max-w-2xl mx-auto"
      >
        <div className="inline-block p-4 bg-spidey-yellow border-3 border-black mb-4 transform -rotate-3 shadow-comic-sm">
          <SearchX className="w-12 h-12 text-spidey-black" />
        </div>
        <h3 className="font-headline text-3xl sm:text-4xl text-spidey-black uppercase mb-2">
          NO COMIC ISSUES FOUND!
        </h3>
        <p className="font-comic text-base sm:text-lg text-gray-700 max-w-md mx-auto mb-6">
          "Looks like the Green Goblin or Mysterio wiped the printing presses clean! Be the first to report new superhero lore."
        </p>
        <button
          onClick={() => {
            soundFx.playThwip();
            onOpenCreateModal();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-lg border-3 border-black shadow-comic comic-button"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>PRINT FIRST STORY</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
          : 'flex flex-col gap-3'
      }
    >
      <AnimatePresence>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewMode={viewMode}
            currentUser={currentUser}
            onSelectPost={onSelectPost}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onLikePost={onLikePost}
            onSpawnParticle={onSpawnParticle}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
