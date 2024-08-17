const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each user to 5 requests per windowMs
  message: "Too many comments created from this IP, please try again after 10 minutes"
});

module.exports = commentLimiter;
