# Build Instructions

## Prerequisites

- **Bun** v1.0 or later
- **Node.js** 18+ (alternative to Bun)

## Installation

```bash
# Clone the repository
git clone https://github.com/AnoRebel/cofall.git
cd cofall

# Install dependencies
bun install

# If bun install hangs, try:
rm -rf node_modules bun.lock
bun install --force
```

## Known Issues & Fixes

### 1. TypeScript Errors

Most TypeScript errors are related to:
- TanStack Form validation adapter (known issue with Nuxt auto-imports)
- User session type properties (nuxt-auth-utils compatibility)

These don't affect runtime functionality.

### 2. Missing Dependencies

If you see errors about missing packages, ensure these are installed:

```bash
bun add jszip @types/jszip
```

### 3. Motion-v Issues

The project uses simple CSS transitions instead of motion-v's `useMotion` to avoid compatibility issues.

## Development

```bash
# Start dev server
bun dev

# Typecheck (will show non-blocking errors)
bun typecheck

# Build for production
bun build
```

## Environment Variables

Create `.env` file:

```env
NUXT_SESSION_PASSWORD=your-super-secret-password-at-least-32-chars
NUXT_PUBLIC_SIGNALING_SERVER=https://cofall-signaling-server.herokuapp.com
NUXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=your-client-id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your-client-secret
```

## Troubleshooting

### Bun install hangs

This is a known issue with Bun on some systems. Try:

```bash
# Clear cache
rm -rf ~/.bun/install/cache

# Use npm instead
npm install

# Or use pnpm
pnpm install
```

### Build fails

1. Clear .nuxt directory: `rm -rf .nuxt`
2. Reinstall: `bun install --force`
3. Try: `bun run postinstall`

### Type errors

To skip type checking during build:

```bash
# nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    typeCheck: false // Skip type checking
  }
})
```

## Production Build

```bash
# Build
bun build

# Preview
bun preview

# Or deploy to your platform
# Vercel: vercel deploy
# Netlify: netlify deploy
```

## Docker (Optional)

```dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/.output ./.output
CMD ["bun", ".output/server/index.mjs"]
```

## Support

For issues related to:
- **Signaling Server**: https://github.com/AnoRebel/cofall-signaling-server
- **Client App**: Open an issue on this repository
