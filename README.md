# Cineova Movie App

## Description

Cineova is a full-stack web application for movie enthusiasts, providing a platform to discover, rate, and manage favorite movies and series. Built with modern web technologies, it offers a seamless user experience for browsing content, creating watchlists, and engaging with a community through ratings and comments.

## Features

- **Movie & Series Browsing**: Explore a vast collection of movies and TV series with detailed information
- **User Authentication**: Secure login and registration using Firebase
- **Personal Watchlist**: Add and manage movies/series to watch later
- **Rating System**: Rate movies and view community ratings
- **Comments Section**: Engage with other users through comments on movies
- **Recommendations**: Get personalized movie recommendations
- **Continue Watching**: Track and resume watching progress
- **Admin Panel**: Administrative features for content management
- **Responsive Design**: Optimized for desktop and mobile devices
- **Anime Support**: Dedicated section for anime content

## Getting Started

### Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 18 or higher)
- MongoDB
- Redis
- Firebase project (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie_lab/movie-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration (MongoDB URI, Redis URL, TMDB API key, Firebase credentials)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000 (or configured port)

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed

## Technologies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Redis** - Caching and session storage
- **Firebase Admin** - Server-side Firebase SDK
- **Axios** - HTTP client for API calls
- **TMDB API** - Movie database integration

### Frontend
- **Next.js** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Client-side authentication
- **Radix UI** - Accessible UI components
- **SWR** - Data fetching library
- **Motion** - Animation library

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Biome** - Fast linter and formatter
- **Nodemon** - Development server auto-restart

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This project does not contain any actual movie content and is created solely for educational purposes. All movie data is sourced from The Movie Database (TMDB) API and is used in accordance with their terms of service.

---

build with ❤️ by Salah
