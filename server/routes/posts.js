const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// REST API Endpoints
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

// Interactivity Endpoints
router.post('/:id/like', postController.likePost);
router.post('/:id/comments', postController.addComment);
router.post('/admin/reset', postController.resetPosts);

module.exports = router;
