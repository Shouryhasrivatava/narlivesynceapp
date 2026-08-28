import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageSquare, Send, Calendar, User, Tag, Edit3, Trash2, Share2, Check, LogIn, Lock } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ActionWordBadge } from './ActionBubble';

export const PostDetailModal = ({
  post,
  isOpen,
  currentUser = null,
  onClose,
  onEdit,
  onDelete,
  onLike,
  onAddComment,
  onSpawnParticle,
  onOpenLoginModal
}) => {
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!isOpen || !post) return null;

  const handleLike = (e) => {
    soundFx.playThwip();
    if (onSpawnParticle) {
      const rect = e.currentTarget.getBoundingClientRect();
      onSpawnParticle(rect.left + rect.width / 2, rect.top, post.soundEffect || 'THWIP!');
    }
    onLike(post.id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      soundFx.playSpiderSense();
      onOpenLoginModal();
      return;
    }

    soundFx.playPop();
    setIsSubmittingComment(true);
    try {
      await onAddComment(post.id, {
        author: currentUser.name,
        avatar: currentUser.avatar || (currentUser.isGuest ? '🕵️' : '🕸️'),
        text: commentText.trim()
      });
      setCommentText('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    soundFx.playPop();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert markdown to clean HTML paragraphs
  const renderFormattedContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Heading
      if (paragraph.startsWith('### ') || paragraph.startsWith('#### ')) {
        const headingText = paragraph.replace(/^[#]+\s*/, '');
        return (
          <h4
            key={index}
            className="font-headline text-2xl sm:text-3xl text-spidey-black uppercase mt-6 mb-2 border-b-2 border-black pb-1"
          >
            {headingText}
          </h4>
        );
      }
      // Blockquote
      if (paragraph.startsWith('> ')) {
        const quoteText = paragraph.replace(/^>\s*/, '');
        return (
          <div
            key={index}
            className="my-5 p-4 bg-yellow-100 border-l-6 border-spidey-black font-comic text-base sm:text-lg italic text-black shadow-comic-sm"
          >
            "{quoteText}"
          </div>
        );
      }
      // Code block
      if (paragraph.startsWith('```')) {
        const codeText = paragraph.replace(/```[a-z]*\n?|```/g, '');
        return (
          <pre
            key={index}
            className="my-4 p-3 bg-spidey-black text-spidey-yellow font-mono text-xs sm:text-sm border-2 border-black overflow-x-auto shadow-comic-sm"
          >
            <code>{codeText}</code>
          </pre>
        );
      }
      // Bullet list
      if (paragraph.includes('\n* ') || paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(Boolean);
        return (
          <ul key={index} className="my-3 space-y-1 font-comic text-base sm:text-lg pl-5 list-disc">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[\*\-]\s*/, '')}</li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="font-comic text-base sm:text-lg leading-relaxed text-gray-900 my-3">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-spidey-paper border-5 border-spidey-black shadow-comic-xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-spidey-black text-white px-6 py-3 flex items-center justify-between border-b-4 border-black flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="bg-spidey-red text-white font-headline text-sm px-2.5 py-0.5 border border-white uppercase tracking-wider">
                {post.category}
              </span>
              <span className="font-headline tracking-widest text-spidey-yellow text-sm hidden sm:inline">
                THE DAILY BUGLE CHRONICLES • ISSUE ID: {post.id}
              </span>
            </div>

            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1 text-white hover:bg-spidey-red hover:text-white transition-colors border-2 border-transparent hover:border-black"
              aria-label="Close"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Scrollable Story Content */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1">
            {/* Title & Action Word */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-spidey-black uppercase leading-tight mb-2">
                  {post.title}
                </h1>
                {/* Author Byline */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 font-sans font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{post.authorAvatar || '🕷️'}</span>
                    <span>Reported by <strong className="text-spidey-black font-headline text-base">{post.author}</strong> ({post.authorRole})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 self-start">
                <ActionWordBadge text={post.soundEffect || 'BOOM!'} angle={-6} />
              </div>
            </div>

            {/* Feature Cover Art */}
            {post.coverImage && (
              <div className="relative border-4 border-spidey-black shadow-comic overflow-hidden max-h-96">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Story Text */}
            <div className="bg-white p-6 border-3 border-spidey-black shadow-comic-sm">
              {renderFormattedContent(post.content)}
            </div>

            {/* Tags Strip */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Tag className="w-4 h-4 text-spidey-black" />
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="font-sans font-bold text-xs bg-spidey-yellow text-spidey-black px-2 py-1 border-2 border-black shadow-comic-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Engagement Bar */}
            <div className="p-4 bg-spidey-paperDark border-3 border-spidey-black flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Hero Clap Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className="flex items-center gap-2 px-4 py-2 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-base border-3 border-black shadow-comic-sm comic-button"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{post.likes || 0} HERO CLAPS</span>
                </motion.button>

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-yellow-100 font-headline text-sm border-2 border-black shadow-comic-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-spidey-black" />}
                  <span>{copied ? 'LINK COPIED!' : 'SHARE'}</span>
                </button>
              </div>

              {/* Edit / Delete Controls (Staff Only) */}
              <div className="flex items-center gap-2">
                {currentUser && !currentUser.isGuest ? (
                  <>
                    <button
                      onClick={() => {
                        soundFx.playPop();
                        onClose();
                        onEdit(post);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-spidey-yellow hover:bg-spidey-darkYellow text-spidey-black font-headline text-sm border-2 border-black shadow-comic-sm comic-button"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>EDIT ISSUE</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playKrash();
                        onClose();
                        onDelete(post);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-headline text-sm border-2 border-black shadow-comic-sm comic-button"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>DELETE</span>
                    </button>
                  </>
                ) : (
                  <span className="font-sans text-xs text-gray-500 font-bold">
                    {currentUser?.isGuest ? 'Guest View • Read Only' : 'Sign in to Edit/Delete'}
                  </span>
                )}
              </div>
            </div>

            {/* Comic Speech Bubble Comments Section */}
            <div className="pt-4 border-t-3 border-spidey-black">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-spidey-red stroke-[2.5]" />
                  <h3 className="font-headline text-2xl sm:text-3xl text-spidey-black uppercase">
                    CITIZEN REACTION BUBBLES ({post.comments?.length || 0})
                  </h3>
                </div>
              </div>

              {/* Comment Bubble Stream */}
              <div className="space-y-4 mb-6">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comm) => (
                    <div key={comm.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-spidey-yellow border-2 border-black flex items-center justify-center text-xl flex-shrink-0 shadow-comic-sm">
                        {comm.avatar || '💬'}
                      </div>
                      <div className="flex-1">
                        <div className="speech-bubble p-3 text-spidey-black">
                          <p className="font-comic font-bold text-sm sm:text-base leading-snug">
                            "{comm.text}"
                          </p>
                        </div>
                        <p className="mt-1 text-[11px] font-sans font-bold text-gray-600 pl-2">
                          — {comm.author} • {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="font-comic italic text-gray-600 text-sm bg-white p-4 border-2 border-black">
                    No comments yet! Speak up and drop the first speech bubble below.
                  </p>
                )}
              </div>

              {/* Add Comment Form or Login Gate */}
              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="bg-white p-4 border-3 border-spidey-black shadow-comic-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-headline text-lg uppercase text-spidey-black flex items-center gap-2">
                      <span>🗯️ DROP A COMIC SPEECH BUBBLE</span>
                    </h4>
                    <span className="font-sans text-xs text-gray-600 font-bold bg-spidey-paper px-2 py-0.5 border border-black">
                      Commenting as: <strong className="text-spidey-red">{currentUser.name}</strong> {currentUser.isGuest && '(Guest)'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input
                      type="text"
                      required
                      placeholder={currentUser.isGuest ? "Speak as an anonymous citizen..." : "Type your superhero reaction..."}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 p-2.5 font-comic text-sm border-2 border-black focus:outline-none focus:bg-yellow-50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-spidey-blue hover:bg-spidey-darkBlue text-white font-headline text-base border-2 border-black shadow-comic-sm comic-button disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingComment ? 'POSTING...' : 'SHOUT BUBBLE!'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Login Gate for Comments */
                <div className="bg-spidey-yellow/50 p-4 border-3 border-black text-center shadow-comic-sm">
                  <Lock className="w-8 h-8 mx-auto text-spidey-black mb-1" />
                  <h4 className="font-headline text-xl uppercase text-spidey-black mb-1">
                    LOGIN REQUIRED TO DROP SPEECH BUBBLES
                  </h4>
                  <p className="font-comic text-sm text-gray-800 max-w-md mx-auto mb-3">
                    "Jameson requires all commentators to identify themselves or check in as an anonymous guest before printing speech bubbles!"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playFreezeFrame();
                      onOpenLoginModal();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-base border-2 border-black shadow-comic-sm comic-button"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>LOGIN OR ENTER AS GUEST</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
