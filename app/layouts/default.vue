<script setup lang="ts">
import { useMotion } from 'motion-v'

const colorMode = useColorMode()
const { loggedIn, user, clear } = useUserSession()
const router = useRouter()

const themeToggle = ref<HTMLElement | null>(null)

// Animated theme toggle
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Apply motion to theme toggle
onMounted(() => {
  if (themeToggle.value) {
    useMotion(themeToggle.value, {
      initial: { scale: 1 },
      hover: { scale: 1.1 },
      tap: { scale: 0.95, rotate: 180 },
    })
  }
})

const handleLogout = async () => {
  await clear()
  router.push('/auth/login')
}

const isDark = computed(() => colorMode.value === 'dark')

// Navigation items
const navItems = computed(() => [
  { label: 'Home', to: '/', icon: 'i-heroicons-home' },
  { label: 'Rooms', to: '/rooms', icon: 'i-heroicons-squares-2x2' },
])
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Animated background grid pattern -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.02]">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-glow">
            <UIcon name="i-heroicons-code-bracket" class="h-5 w-5" />
            <!-- Animated brackets -->
            <span class="absolute -left-1 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-x-1">&lt;</span>
            <span class="absolute -right-1 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">/&gt;</span>
          </div>
          <span class="font-mono text-xl font-bold">
            <span class="text-primary">Co</span><span class="text-accent">Fall</span>
          </span>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted"
            active-class="!text-primary !bg-primary/10"
          >
            <UIcon :name="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle with animation -->
          <button
            ref="themeToggle"
            @click="toggleTheme"
            class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <!-- Sun icon -->
            <UIcon
              name="i-heroicons-sun"
              class="absolute h-5 w-5 transition-all duration-500"
              :class="isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'"
            />
            <!-- Moon icon -->
            <UIcon
              name="i-heroicons-moon"
              class="absolute h-5 w-5 transition-all duration-500"
              :class="isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'"
            />
          </button>

          <!-- User menu -->
          <template v-if="loggedIn">
            <UDropdownMenu>
              <UDropdownMenuTrigger as-child>
                <button class="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                  <UAvatar
                    :src="user?.avatar"
                    :alt="user?.username"
                    size="xs"
                    class="h-6 w-6"
                  />
                  <span class="hidden sm:inline">{{ user?.username }}</span>
                  <UIcon name="i-heroicons-chevron-down" class="h-4 w-4 opacity-50" />
                </button>
              </UDropdownMenuTrigger>
              <UDropdownMenuContent align="end" class="w-48">
                <UDropdownMenuLabel>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ user?.username }}</span>
                    <span class="text-xs text-muted-foreground">{{ user?.email }}</span>
                  </div>
                </UDropdownMenuLabel>
                <UDropdownMenuSeparator />
                <UDropdownMenuItem as-child>
                  <NuxtLink to="/profile" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-user" class="h-4 w-4" />
                    Profile
                  </NuxtLink>
                </UDropdownMenuItem>
                <UDropdownMenuItem as-child>
                  <NuxtLink to="/settings" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-cog-6-tooth" class="h-4 w-4" />
                    Settings
                  </NuxtLink>
                </UDropdownMenuItem>
                <UDropdownMenuSeparator />
                <UDropdownMenuItem @click="handleLogout" class="text-destructive focus:text-destructive">
                  <UIcon name="i-heroicons-arrow-left-on-rectangle" class="h-4 w-4 mr-2" />
                  Logout
                </UDropdownMenuItem>
              </UDropdownMenuContent>
            </UDropdownMenu>
          </template>

          <!-- Auth buttons -->
          <template v-else>
            <NuxtLink to="/auth/login">
              <UButton variant="ghost" size="sm">
                Sign In
              </UButton>
            </NuxtLink>
            <NuxtLink to="/auth/register">
              <UButton size="sm" class="hidden sm:flex">
                Get Started
              </UButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="relative">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border/50 bg-background/50">
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <UIcon name="i-heroicons-code-bracket" class="h-4 w-4 text-primary" />
            <span>CoFall - Code For All</span>
          </div>
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <NuxtLink to="/about" class="hover:text-foreground transition-colors">
              About
            </NuxtLink>
            <NuxtLink to="/docs" class="hover:text-foreground transition-colors">
              Docs
            </NuxtLink>
            <a
              href="https://github.com/AnoRebel/cofall"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-foreground transition-colors"
            >
              <UIcon name="i-simple-icons-github" class="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Notifications -->
    <UNotifications />
  </div>
</template>
