const fs = require('fs');
const path = require('path');
const { getSeedPosts } = require('../data/seed');

const dataFilePath = path.join(__dirname, '../data/posts.json');

// Helper to read posts safely
const readPostsFromFile = () => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const initial = getSeedPosts();
      fs.writeFileSync(dataFilePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading posts file:', error);
    return getSeedPosts();
  }
};

// Helper to write posts safely
const writePostsToFile = (posts) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing posts file:', error);
    return false;
  }
};

// Helper to slugify title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// GET /api/posts
exports.getAllPosts = (req, res) => {
  try {
    let posts = readPostsFromFile();
    const { q, category, tag, sort } = req.query;

    // Filter by search query (title, content, author, tags)
    if (q) {
      const query = q.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
      );
    }

    // Filter by Category
    if (category && category !== 'All') {
      posts = posts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by Tag
    if (tag) {
      posts = posts.filter(
        (p) => p.tags && p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
      );
    }

    // Sort
    if (sort === 'popular') {
      posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sort === 'oldest') {
      posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // default: latest
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error reading posts' });
  }
};

// GET /api/posts/:id
exports.getPostById = (req, res) => {
  try {
    const posts = readPostsFromFile();
    const { id } = req.params;
    const post = posts.find((p) => p.id === id || p.slug === id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Holy Multiverse! Comic issue with ID '${id}' not found!`
      });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching post' });
  }
};

// POST /api/posts
exports.createPost = (req, res) => {
  try {
    const { title, content, author, authorRole, category, tags, coverImage, soundEffect } = req.body;

    // Basic Form Validations
    const errors = [];
    if (!title || title.trim().length < 3) {
      errors.push('Headline Title is required (minimum 3 characters).');
    }
    if (!content || content.trim().length < 10) {
      errors.push('Comic Story Content is required (minimum 10 characters).');
    }
    if (!author || author.trim().length === 0) {
      errors.push('Hero / Reporter Author name is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Spider-Sense Alert: Validation failed!',
        errors
      });
    }

    const posts = readPostsFromFile();
    const newId = `issue-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Default comic sound effects
    const soundEffectsList = ['THWIP!', 'POW!', 'BAM!', 'KRASH!', 'BOOM!', 'ZAP!'];
    const chosenSound = soundEffect || soundEffectsList[Math.floor(Math.random() * soundEffectsList.length)];

    // Avatar mapping
    const avatarMap = {
      Scoop: '📰',
      'Hero Log': '🕸️',
      'Villain Alert': '🚨',
      'Tech & Gear': '🧪',
      Multiverse: '🌌'
    };

    const newPost = {
      id: newId,
      title: title.trim(),
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      excerpt: req.body.excerpt || (content.length > 120 ? content.substring(0, 120) + '...' : content),
      content: content.trim(),
      author: author.trim(),
      authorRole: authorRole?.trim() || 'Daily Bugle Correspondent',
      authorAvatar: avatarMap[category] || '🕷️',
      category: category || 'Hero Log',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['Marvel', 'Spider-Man']),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1000&q=80',
      soundEffect: chosenSound,
      likes: 0,
      comments: [],
      createdAt: now,
      updatedAt: now
    };

    posts.unshift(newPost);
    writePostsToFile(posts);

    res.status(201).json({
      success: true,
      message: 'Excelsior! New comic post published successfully!',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating post' });
  }
};

// PUT /api/posts/:id
exports.updatePost = (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author, authorRole, category, tags, coverImage, soundEffect, excerpt } = req.body;

    const posts = readPostsFromFile();
    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Comic issue with ID '${id}' does not exist.`
      });
    }

    // Validation
    const errors = [];
    if (title && title.trim().length < 3) {
      errors.push('Title must be at least 3 characters.');
    }
    if (content && content.trim().length < 10) {
      errors.push('Content must be at least 10 characters.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Spider-Sense Alert: Validation failed on update!',
        errors
      });
    }

    const currentPost = posts[index];
    const updatedPost = {
      ...currentPost,
      title: title !== undefined ? title.trim() : currentPost.title,
      excerpt: excerpt !== undefined ? excerpt.trim() : (content ? (content.length > 120 ? content.substring(0, 120) + '...' : content) : currentPost.excerpt),
      content: content !== undefined ? content.trim() : currentPost.content,
      author: author !== undefined ? author.trim() : currentPost.author,
      authorRole: authorRole !== undefined ? authorRole.trim() : currentPost.authorRole,
      category: category !== undefined ? category : currentPost.category,
      tags: tags !== undefined ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : currentPost.tags,
      coverImage: coverImage !== undefined ? coverImage : currentPost.coverImage,
      soundEffect: soundEffect !== undefined ? soundEffect : currentPost.soundEffect,
      updatedAt: new Date().toISOString()
    };

    posts[index] = updatedPost;
    writePostsToFile(posts);

    res.json({
      success: true,
      message: 'Comic issue updated successfully!',
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating post' });
  }
};

// DELETE /api/posts/:id
exports.deletePost = (req, res) => {
  try {
    const { id } = req.params;
    let posts = readPostsFromFile();
    const postToDelete = posts.find((p) => p.id === id);

    if (!postToDelete) {
      return res.status(404).json({
        success: false,
        message: `Cannot delete: Issue '${id}' not found.`
      });
    }

    posts = posts.filter((p) => p.id !== id);
    writePostsToFile(posts);

    res.json({
      success: true,
      message: `KRASH! Comic issue '${postToDelete.title}' has been vaporized!`,
      data: postToDelete
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting post' });
  }
};

// POST /api/posts/:id/like
exports.likePost = (req, res) => {
  try {
    const { id } = req.params;
    const posts = readPostsFromFile();
    const post = posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.likes = (post.likes || 0) + 1;
    writePostsToFile(posts);

    res.json({
      success: true,
      message: 'THWIP! Hero clap recorded!',
      data: { id: post.id, likes: post.likes }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error liking post' });
  }
};

// POST /api/posts/:id/comments
exports.addComment = (req, res) => {
  try {
    const { id } = req.params;
    const { author, text, avatar } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment speech bubble cannot be empty!'
      });
    }

    const posts = readPostsFromFile();
    const post = posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!post.comments) post.comments = [];

    const avatars = ['🕸️', '🕷️', '⚡', '📰', '🥁', '🥞', '🧪', '💥'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newComment = {
      id: `comm-${Date.now()}`,
      author: (author && author.trim()) || 'Web-Slinger Fan',
      avatar: avatar || randomAvatar,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    writePostsToFile(posts);

    res.status(201).json({
      success: true,
      message: 'Comic speech bubble comment added!',
      data: newComment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// POST /api/posts/reset (Restore default Marvel seed)
exports.resetPosts = (req, res) => {
  try {
    const defaultData = getSeedPosts();
    writePostsToFile(defaultData);
    res.json({
      success: true,
      message: 'Multiverse reset! Default Marvel comic posts restored.',
      data: defaultData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting posts' });
  }
};
