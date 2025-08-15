# Swift Secrets 🎵

A beautiful, interactive showcase of Taylor Swift Easter eggs and hidden clues discovered by Swifties around the world.

## ✨ Features

- **Easter Egg Discovery**: Browse through a curated collection of Taylor Swift Easter eggs
- **Smart Filtering**: Filter by album, media type, clue type, and search keywords
- **Responsive Design**: Beautiful UI that works on all devices
- **Interactive Cards**: Click on any Easter egg to see detailed information
- **Modern UI**: Built with Next.js 15 and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+ or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/e-deng/eggs.git
cd eggs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript
- **Package Manager**: npm

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run tests (placeholder)

## 🎨 Project Structure

```
eggs/
├── app/                      # Next.js app directory (App Router)
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Loading component
│   └── page.tsx             # Home page
├── src/                      # Source code directory
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── theme-provider.tsx
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── styles/               # Additional styles
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper utilities
├── public/                   # Static assets
├── .gitignore               # Git ignore rules
├── .npmrc                   # NPM configuration
├── .nvmrc                   # Node.js version specification
├── components.json          # shadcn/ui configuration
├── next.config.mjs          # Next.js configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.mjs       # PostCSS configuration
├── README.md                # Project documentation
└── tsconfig.json            # TypeScript configuration
```

## 🌟 Easter Egg Categories

- **Albums**: Fearless, Speak Now, Red, 1989, reputation, Lover, folklore, evermore, Midnights, TTPD
- **Media Types**: Music Video, Performance, Fashion, Photo, Social Media, Interview, Album Art, Music
- **Clue Types**: Visual, Color, Hidden Message, Number, Symbol, Time, Lyric

## 🔧 Development

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting (configured but not enforced)

### Build Process
- **Development**: Hot reload with Next.js dev server
- **Production**: Optimized build with Next.js
- **Type Checking**: Separate TypeScript compilation step

## 🤝 Contributing

This is a showcase project featuring discovered Easter eggs. The current implementation uses mock data to demonstrate the interface and functionality.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Taylor Swift for the incredible music and hidden clues
- The Swiftie community for discovering and sharing Easter eggs
- shadcn/ui for the beautiful component library
- Next.js team for the amazing framework

---

Made with 💜💖💛 by Swifties for Swifties
