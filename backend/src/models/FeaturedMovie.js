import mongoose from 'mongoose';

const featuredMovieSchema = new mongoose.Schema({
  movieId: {
    type: Number,
    required: true,
    unique: true,
  },
  featuredAt: {
    type: Date,
    default: Date.now,
  },
  featuredBy: {
    type: String,
    required: true,
  },
});

const FeaturedMovie = mongoose.model('FeaturedMovie', featuredMovieSchema);

export default FeaturedMovie;
