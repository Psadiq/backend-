const express = require('express');
const Comment = require('../models/Comment');
const authenticateToken = require('../middleware/auth');
const commentLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Create a new comment
router.post('/:postId/comments', authenticateToken, commentLimiter, async (req, res) => {
  try {
    const comment = new Comment({
      postId: req.params.postId,
      text: req.body.text,
      userId: req.user.id,
      parentCommentId: req.body.parentCommentId || null
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments with pagination
router.get('/:postId/comments', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;

    const comments = await Comment.find({ postId: req.params.postId, parentCommentId: null })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(pageSize))
      .populate('userId');

    const totalComments = await Comment.countDocuments({ postId: req.params.postId, parentCommentId: null });

    res.json({
      comments,
      pagination: {
        totalComments,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalComments / pageSize),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to a comment
router.post('/:postId/comments/:commentId/reply', authenticateToken, commentLimiter, async (req, res) => {
  try {
    const reply = new Comment({
      postId: req.params.postId,
      text: req.body.text,
      userId: req.user.id,
      parentCommentId: req.params.commentId
    });
    await reply.save();
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
