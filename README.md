# CoFall - Code For All

A real-time pair programming platform with integrated chat, voice & video calls, and file sharing. Built with Nuxt v4 and modern web technologies.

## Features

- **Real-time Code Collaboration** - Code together with syntax highlighting for 15+ languages
- **Integrated Chat** - Room-based chat with typing indicators and notifications
- **Voice & Video Calls** - WebRTC-powered voice and video communication
- **Screen Sharing** - Share your screen with room participants
- **File Import/Export** - Import local files/folders and export your work
- **Developer-Themed UI** - Dark/light mode with animated transitions
- **Authentication** - GitHub OAuth and username/password auth

## Tech Stack

- **Framework**: Nuxt v4 with Vue 3
- **UI Components**: Nuxt UI + ShadCN-Vue
- **Styling**: TailwindCSS v4 (CSS-first config)
- **State Management**: VueUse composables
- **Forms**: TanStack Form + Valibot validation
- **Animations**: FormKit Auto-Animate + Motion-V
- **Code Editor**: CodeMirror 6
- **Real-time**: Socket.IO
- **WebRTC**: PeerJS
- **Auth**: nuxt-auth-utils + nuxt-authorization
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A signaling server (uses [cofall-signaling-server](https://github.com/AnoRebel/cofall-signaling-server))

### Installation

```bash
# Clone the repository
git clone https://github.com/AnoRebel/cofall.git
cd cofall

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server
bun dev
```

### Environment Variables

```env
# Session
NUXT_SESSION_PASSWORD=your-super-secret-session-password-at-least-32-chars

# OAuth - GitHub (optional)
NUXT_OAUTH_GITHUB_CLIENT_ID=your-github-client-id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# Public
NUXT_PUBLIC_SIGNALING_SERVER=https://cofall-signaling-server.herokuapp.com
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
cofall/
├── app/
│   ├── components/     # Vue components
│   ├── composables/    # Vue composables
│   ├── layouts/        # Page layouts
│   ├── middleware/     # Route middleware
│   ├── pages/          # File-based routing
│   ├── plugins/        # Nuxt plugins
│   └── utils/          # Utility functions
├── server/
│   ├── api/            # API routes
│   ├── middleware/     # Server middleware
│   └── utils/          # Server utilities
├── assets/
│   └── css/            # Global styles
├── public/             # Static assets
├── types/              # TypeScript types
└── nuxt.config.ts      # Nuxt configuration
```

## Key Composables

- `useSocket` - Socket.IO connection management
- `useCodeEditor` - CodeMirror 6 editor setup
- `useWebRTC` - PeerJS voice/video/file sharing
- `useFileManager` - File import/export utilities

## Supported Languages

JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, HTML, CSS, JSON, XML, SQL, PHP, Markdown

## Demo

Use these credentials to test the app:
- Username: `demo`
- Password: `demo123`

## Development

```bash
# Start development server
bun dev

# Type check
bun typecheck

# Build for production
bun build

# Preview production build
bun preview
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original React version by [AnoRebel](https://github.com/AnoRebel)
- Signaling server: [cofall-signaling-server](https://github.com/AnoRebel/cofall-signaling-server)
