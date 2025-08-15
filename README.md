# Taylor Swift Easter Eggs 🥚

A beautiful, interactive showcase of Taylor Swift Easter eggs and hidden clues discovered by Swifties around the world. Built with a MERN-style stack using **Express.js** backend, **React** frontend, and **Supabase** as the database.

## 🏗️ Architecture

This project follows a **MERN-style stack** but replaces MongoDB with **Supabase**:

- **Backend**: Express.js server with RESTful API endpoints
- **Frontend**: React.js with Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth (ready to implement)

## 🚀 Quick Start

### Prerequisites

- Node.js (>=18.0.0)
- npm (>=8.0.0)
- Supabase account and project

### 1. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

### 3. Run the Application

```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

## 📁 Project Structure

```
eggs/
├── server.js                 # Express server entry point
├── package.json             # Server dependencies
├── .env                     # Environment variables
├── client/                  # React frontend
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   ├── package.json        # Client dependencies
│   └── tailwind.config.js  # Tailwind CSS config
└── README.md               # This file
```

## 🔌 API Endpoints

The Express server provides these RESTful endpoints:

- `GET /api/easter-eggs` - Fetch all Easter eggs
- `POST /api/easter-eggs` - Add a new Easter egg
- `GET /api/easter-eggs/:id/comments` - Fetch comments for an egg
- `POST /api/comments` - Add a new comment
- `GET /api/health` - Health check endpoint

## 🎨 Features

- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Comments and interactions update instantly
- **Search & Filter**: Find Easter eggs by album, media type, or keywords
- **Interactive Modals**: Detailed views with comment sections
- **Modern UI**: Built with Tailwind CSS for a polished look

## 🗄️ Database Schema

### Easter Eggs Table
```sql
CREATE TABLE easter_eggs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  album TEXT,
  media_type TEXT,
  clue_type TEXT,
  image_url TEXT,
  video_url TEXT,
  upvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  easter_egg_id UUID REFERENCES easter_eggs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start both server and client in development mode
- `npm run server` - Start only the Express server
- `npm run client` - Start only the React client
- `npm run build` - Build the React app for production
- `npm start` - Start the production server

### Adding New Features

1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Create new components in `client/src/components/`
3. **Database**: Update Supabase schema as needed

## 🌟 Why This Stack?

- **Express.js**: Lightweight, flexible Node.js framework
- **React**: Component-based UI library with great developer experience
- **Supabase**: Modern alternative to Firebase with PostgreSQL backend
- **JavaScript**: No TypeScript compilation overhead, faster development
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Taylor Swift for the amazing music and hidden clues
- The Swiftie community for discovering these Easter eggs
- Supabase team for the excellent database platform
- Tailwind CSS team for the amazing utility-first CSS framework
