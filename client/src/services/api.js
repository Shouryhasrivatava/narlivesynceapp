// REST API Client for Daily Bugle / Spider-Man Comic CMS

const API_BASE = '/api/posts';

export const api = {
  // GET all posts with query filters
  async getPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.tag) query.append('tag', params.tag);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}${queryString}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
    return data.data;
  },

  // GET single post
  async getPostById(id) {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load post');
    return data.data;
  },

  // POST create post
  async createPost(postData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to create post');
      err.errors = data.errors || [];
      throw err;
    }
    return data.data;
  },

  // PUT update post
  async updatePost(id, postData) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to update post');
      err.errors = data.errors || [];
      throw err;
    }
    return data.data;
  },

  // DELETE post
  async deletePost(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete post');
    return data.data;
  },

  // POST like post
  async likePost(id) {
    const res = await fetch(`${API_BASE}/${id}/like`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to like post');
    return data.data;
  },

  // POST add speech bubble comment
  async addComment(id, commentData) {
    const res = await fetch(`${API_BASE}/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add comment');
    return data.data;
  },

  // POST restore seed posts
  async resetSeedData() {
    const res = await fetch(`${API_BASE}/admin/reset`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset seed data');
    return data.data;
  },

  // Auth: Login
  async login(credentials) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  // Auth: Guest Login
  async guestLogin() {
    const res = await fetch('/api/auth/guest', {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Guest entry failed');
    return data;
  },

  // Auth: Presets
  async getPresets() {
    const res = await fetch('/api/auth/presets');
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to load presets');
    return data.presets || [];
  }
};
