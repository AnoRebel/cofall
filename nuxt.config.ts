// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Nuxt v4 future settings
  future: {
    compatibilityVersion: 4,
  },

  // App configuration
  app: {
    head: {
      title: 'CoFall - Code For All',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real-time pair programming platform with chat, voice, and video collaboration' },
        { name: 'theme-color', content: '#0d1117' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  // CSS
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-auth-utils',
    'nuxt-authorization',
    '@formkit/auto-animate/nuxt',
  ],

  // Color mode configuration
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  // Runtime config
  runtimeConfig: {
    // Server-side only
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || 'super-secret-password-at-least-32-chars',
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID || '',
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET || '',
      },
    },
    // Public (exposed to client)
    public: {
      signalingServer: process.env.NUXT_PUBLIC_SIGNALING_SERVER || 'https://cofall-signaling-server.herokuapp.com',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  // Vite configuration for TailwindCSS v4
  vite: {
    css: {
      transformer: 'lightningcss',
    },
    build: {
      rollupOptions: {
        external: (id) => {
          // Make jszip and file-saver optional (fail gracefully if not installed)
          if (id === 'jszip' || id === 'file-saver') {
            return false  // Try to bundle them, but don't fail if missing
          }
          return false
        },
      },
    },
  },

  // Nitro server configuration
  nitro: {
    experimental: {
      websocket: true,
    },
  },

  // TypeScript
  typescript: {
    strict: true,
    shim: false,
  },
})
