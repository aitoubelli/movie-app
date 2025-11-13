import Comment from '../models/Comment.js';

const validateMovieId = (movieId) => {
  const id = parseInt(movieId, 10);
  return !isNaN(id) && id > 0;
};

const validateText = (text) => {
  return text && text.length >= 1 && text.length <= 500;
};

export const postComment = async (req, res) => {
  try {
    const { movieId, text } = req.body;
    const userId = req.user.uid;
    const userName = req.user.email;

    if (!validateMovieId(movieId)) {
      return res.status(400).json({ error: 'Invalid movieId. Must be a positive integer.' });
    }

    if (!validateText(text)) {
      return res.status(400).json({ error: 'Invalid text. Must be between 1 and 500 characters.' });
    }

    const comment = new Comment({ movieId, userId, userName, text });
    await comment.save();

    res.status(201).json({ message: 'Comment posted successfully' });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommentsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!validateMovieId(movieId)) {
      return res.status(400).json({ error: 'Invalid movieId. Must be a positive integer.' });
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error:
          'Invalid pagination parameters. Page and limit must be positive integers, limit cannot exceed 100.',
      });
    }

    const skip = (page - 1) * limit;

    // Get total count for pagination calculation
    const totalComments = await Comment.countDocuments({ movieId });
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find({ movieId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      comments,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
