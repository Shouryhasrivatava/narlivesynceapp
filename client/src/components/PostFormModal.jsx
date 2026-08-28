import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Image as ImageIcon, Eye, Check, AlertCircle, Upload, Link2, Grid, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ActionWordBadge } from './ActionBubble';

export const PRESET_COVERS = [
  { label: 'Classic Swing', url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rooftop Stance', url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Spider-Verse Neon', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Empire State View', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Web Lab Tech', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Symbiote Dark', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Villain Clash', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Miles Brooklyn Leap', url: 'https://images.unsplash.com/photo-1568832359672-e36cf5d74f54?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Vintage Daily Bugle', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Comic Book Art', url: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Red & Blue Action', url: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Multiverse Portal', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Night Cityscape', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Queens Alleyway', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Green Goblin Sky', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Avengers Tower', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Midnight Spider-Sense', url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Peter Lab Chemistry', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80' }
];

const SOUND_EFFECTS = ['THWIP!', 'POW!', 'BAM!', 'KRASH!', 'BOOM!', 'ZAP!', 'WHAM!'];
const CATEGORIES = ['Scoop', 'Hero Log', 'Villain Alert', 'Tech & Gear', 'Multiverse'];

export const PostFormModal = ({
  isOpen,
  initialData = null,
  currentUser = null,
  onClose,
  onSubmit,
  onTriggerSpiderSense
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [category, setCategory] = useState('Hero Log');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [imageMode, setImageMode] = useState('preset'); // 'preset' | 'upload' | 'url'
  const [soundEffect, setSoundEffect] = useState('THWIP!');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setExcerpt(initialData.excerpt || '');
      setAuthor(initialData.author || (currentUser ? currentUser.name : 'Peter Parker'));
      setAuthorRole(initialData.authorRole || (currentUser ? currentUser.role : 'Daily Bugle Photographer'));
      setCategory(initialData.category || 'Hero Log');
      setTags(Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''));
      setCoverImage(initialData.coverImage || PRESET_COVERS[0].url);
      setSoundEffect(initialData.soundEffect || 'THWIP!');
    } else {
      // Default to logged-in user or Peter Parker
      setTitle('');
      setContent('');
      setExcerpt('');
      setAuthor(currentUser ? currentUser.name : 'Peter Parker');
      setAuthorRole(currentUser ? currentUser.role : 'Daily Bugle Photographer');
      setCategory('Hero Log');
      setTags('Spider-Man, Queens, Patrol');
      setCoverImage(PRESET_COVERS[0].url);
      setSoundEffect('THWIP!');
    }
    setErrors({});
    setActiveTab('edit');
  }, [initialData, isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      soundFx.playPop();
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Headline title is required!';
    } else if (title.trim().length < 3) {
      errs.title = 'Headline must be at least 3 characters long.';
    }

    if (!content.trim()) {
      errs.content = 'Comic story content cannot be empty!';
    } else if (content.trim().length < 10) {
      errs.content = 'Content must be at least 10 characters long.';
    }

    if (!author.trim()) {
      errs.author = 'Author name / alias is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      soundFx.playSpiderSense();
      if (onTriggerSpiderSense) {
        onTriggerSpiderSense({
          type: 'error',
          title: 'SPIDER-SENSE VALIDATION ALERT!',
          message: 'Please resolve the highlighted fields before printing the issue.',
          errors: Object.values(errors)
        });
      }
      return;
    }

    setIsSubmitting(true);
    soundFx.playThwip();

    const postPayload = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || (content.length > 120 ? content.substring(0, 120) + '...' : content),
      author: author.trim(),
      authorRole: authorRole.trim() || 'Daily Bugle Contributor',
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage.trim(),
      soundEffect
    };

    try {
      await onSubmit(postPayload);
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-spidey-paper border-5 border-spidey-black shadow-comic-xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        >
          {/* Top Bar */}
          <div className="bg-spidey-red text-white px-6 py-3 flex items-center justify-between border-b-4 border-black flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h2 className="font-headline tracking-wider text-xl sm:text-2xl uppercase">
                {isEditMode ? 'EDIT COMIC CHRONICLE' : 'AUTHOR NEW COMIC CHRONICLE'}
              </h2>
            </div>

            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="p-1 text-white hover:bg-black transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Tab Switcher: Form vs Live Preview */}
          <div className="bg-spidey-black px-6 py-2 flex items-center justify-between border-b-2 border-black flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab('edit');
                }}
                className={`px-3 py-1 font-headline text-sm border-2 border-black transition-all ${
                  activeTab === 'edit'
                    ? 'bg-spidey-yellow text-spidey-black shadow-comic-sm'
                    : 'bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                1. EDIT STORY
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab('preview');
                }}
                className={`flex items-center gap-1 px-3 py-1 font-headline text-sm border-2 border-black transition-all ${
                  activeTab === 'preview'
                    ? 'bg-spidey-yellow text-spidey-black shadow-comic-sm'
                    : 'bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2. LIVE PANEL PREVIEW</span>
              </button>
            </div>

            {currentUser && (
              <span className="font-sans text-xs text-spidey-yellow font-bold hidden sm:inline">
                Logged in as: {currentUser.name} ({currentUser.badge || 'STAFF'})
              </span>
            )}
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 flex-1">
            {activeTab === 'edit' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                    Story Headline <span className="text-spidey-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DAILY BUGLE EXCLUSIVE: Mysterio Illusion in Times Square!"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors({ ...errors, title: null });
                    }}
                    className={`w-full p-2.5 font-comic text-base border-3 border-spidey-black shadow-comic-sm focus:outline-none focus:bg-yellow-50 ${
                      errors.title ? 'border-spidey-red bg-red-50' : 'bg-white'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 font-sans font-bold text-xs text-spidey-red flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
                    </p>
                  )}
                </div>

                {/* Excerpt / Teaser */}
                <div>
                  <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                    Front-Page Teaser / Excerpt <span className="text-xs text-gray-500 font-sans">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Short one-line punchy teaser..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full p-2 font-comic text-sm border-2 border-spidey-black bg-white focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Author & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                      Author / Superhero Alias <span className="text-spidey-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Peter Parker / Gwen Stacy"
                      value={author}
                      onChange={(e) => {
                        setAuthor(e.target.value);
                        if (errors.author) setErrors({ ...errors, author: null });
                      }}
                      className="w-full p-2 font-comic text-sm border-2 border-spidey-black bg-white focus:outline-none focus:bg-yellow-50"
                    />
                  </div>

                  <div>
                    <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Freelance Photographer / Avenger"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="w-full p-2 font-comic text-sm border-2 border-spidey-black bg-white focus:outline-none focus:bg-yellow-50"
                    />
                  </div>
                </div>

                {/* Category & Sound Effect */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                      Comic Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 font-headline text-sm uppercase border-2 border-spidey-black bg-white focus:outline-none cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                      Action Sound Sticker
                    </label>
                    <select
                      value={soundEffect}
                      onChange={(e) => {
                        setSoundEffect(e.target.value);
                        soundFx.playPow();
                      }}
                      className="w-full p-2 font-headline text-sm uppercase border-2 border-spidey-black bg-spidey-yellow focus:outline-none cursor-pointer"
                    >
                      {SOUND_EFFECTS.map((sfx) => (
                        <option key={sfx} value={sfx}>
                          {sfx}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cover Image Selector with Toggle Buttons (Upload vs Presets vs URL) */}
                <div className="bg-spidey-paperDark p-3.5 border-3 border-black shadow-comic-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="font-headline text-base uppercase text-spidey-black">
                      Story Cover Illustration
                    </label>

                    {/* Image Mode Switcher Tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 border-2 border-black">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setImageMode('preset');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 font-headline text-xs uppercase border border-black ${
                          imageMode === 'preset'
                            ? 'bg-spidey-red text-white shadow-comic-sm'
                            : 'bg-white text-black hover:bg-yellow-100'
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5" />
                        <span>Pinterest Presets</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setImageMode('upload');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 font-headline text-xs uppercase border border-black ${
                          imageMode === 'upload'
                            ? 'bg-spidey-red text-white shadow-comic-sm'
                            : 'bg-white text-black hover:bg-yellow-100'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playPop();
                          setImageMode('url');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 font-headline text-xs uppercase border border-black ${
                          imageMode === 'url'
                            ? 'bg-spidey-red text-white shadow-comic-sm'
                            : 'bg-white text-black hover:bg-yellow-100'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Paste URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Preset Gallery */}
                  {imageMode === 'preset' && (
                    <div>
                      <p className="text-xs font-sans text-gray-700 font-bold mb-2">
                        Choose from 18+ high-definition Spider-Man aesthetic covers:
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border-2 border-black bg-white">
                        {PRESET_COVERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              soundFx.playPop();
                              setCoverImage(preset.url);
                            }}
                            className={`relative border-2 border-black overflow-hidden h-16 transition-all group ${
                              coverImage === preset.url
                                ? 'ring-4 ring-spidey-red scale-105 z-10'
                                : 'opacity-85 hover:opacity-100 hover:scale-102'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[8.5px] text-white font-headline truncate px-1 py-0.5 leading-tight text-center">
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Local File Upload */}
                  {imageMode === 'upload' && (
                    <div className="bg-white p-4 border-2 border-black text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Upload className="w-8 h-8 text-spidey-red" />
                        <p className="font-headline text-base uppercase text-spidey-black">
                          Upload Image from Computer
                        </p>
                        <p className="font-comic text-xs text-gray-600">
                          Supports PNG, JPG, JPEG, WEBP, GIF
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-1 px-4 py-1.5 bg-spidey-yellow hover:bg-spidey-darkYellow text-spidey-black font-headline text-sm border-2 border-black shadow-comic-sm comic-button"
                        >
                          CHOOSE IMAGE FILE
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Direct URL */}
                  {imageMode === 'url' && (
                    <div className="bg-white p-3 border-2 border-black">
                      <label className="block font-headline text-xs uppercase text-spidey-black mb-1">
                        Direct Image URL (e.g. Pinterest, Unsplash, Imgur)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full p-2 font-mono text-xs border-2 border-spidey-black bg-white focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Image Preview Thumbnail */}
                  {coverImage && (
                    <div className="mt-3 flex items-center gap-3 bg-white p-2 border-2 border-black">
                      <img
                        src={coverImage}
                        alt="Current Cover Preview"
                        className="w-16 h-12 object-cover border border-black shadow-comic-sm"
                      />
                      <div className="truncate text-xs font-sans text-gray-700">
                        <span className="font-bold text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cover Selected
                        </span>
                        <span className="truncate block font-mono text-[10px] text-gray-500 max-w-sm">
                          {coverImage.substring(0, 60)}...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                    Comic Tags <span className="text-xs text-gray-500 font-sans">(Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Spider-Man, Peter Parker, Midtown, Daily Bugle"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2 font-comic text-sm border-2 border-spidey-black bg-white focus:outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block font-headline text-base uppercase text-spidey-black mb-1">
                    Comic Story Content <span className="text-spidey-red">*</span>
                  </label>
                  <p className="text-xs font-sans text-gray-600 mb-1">
                    Supports Markdown formatting (e.g. <code>### Header</code>, <code>&gt; Blockquote</code>, <code>* Bullet list</code>).
                  </p>
                  <textarea
                    required
                    rows={7}
                    placeholder="Write the full report, witness interviews, or lab notes here..."
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (errors.content) setErrors({ ...errors, content: null });
                    }}
                    className={`w-full p-3 font-comic text-sm border-3 border-spidey-black shadow-comic-sm focus:outline-none focus:bg-yellow-50 ${
                      errors.content ? 'border-spidey-red bg-red-50' : 'bg-white'
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 font-sans font-bold text-xs text-spidey-red flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.content}
                    </p>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t-3 border-black flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      onClose();
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-headline text-sm border-2 border-black"
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-lg border-3 border-black shadow-comic comic-button disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{isSubmitting ? 'PRINTING...' : isEditMode ? 'UPDATE ISSUE' : 'PUBLISH TO PRESS!'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Live Preview Mode */
              <div className="space-y-4">
                <div className="bg-spidey-yellow p-2 border-2 border-black font-headline text-sm text-center">
                  ⚡ LIVE COMIC CARD PREVIEW
                </div>

                <div className="max-w-md mx-auto bg-white border-4 border-spidey-black shadow-comic-lg p-4">
                  <div className="relative h-48 border-2 border-black overflow-hidden mb-3 bg-black">
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2">
                      <ActionWordBadge text={soundEffect} angle={6} />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-spidey-red text-white font-headline text-xs px-2 py-0.5 border border-black">
                      {category}
                    </div>
                  </div>

                  <h3 className="font-headline text-2xl text-spidey-black uppercase leading-tight mb-2">
                    {title || 'YOUR COMIC HEADLINE HERE'}
                  </h3>

                  <p className="font-comic text-sm text-gray-800 mb-3">
                    {excerpt || (content ? (content.length > 100 ? content.substring(0, 100) + '...' : content) : 'Short story teaser goes here...')}
                  </p>

                  <div className="pt-2 border-t-2 border-black flex items-center justify-between text-xs font-sans font-bold">
                    <span>By {author || 'Peter Parker'}</span>
                    <span className="bg-spidey-yellow px-2 py-0.5 border border-black font-headline">
                      {soundEffect}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="px-4 py-1.5 bg-white hover:bg-gray-100 font-headline text-sm border-2 border-black shadow-comic-sm"
                  >
                    ← BACK TO EDITING
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
