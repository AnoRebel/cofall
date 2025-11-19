<script setup lang="ts">
import { useMotion } from 'motion-v'

definePageMeta({
  layout: 'default',
})

const { loggedIn } = useUserSession()

// Features list
const features = [
  {
    icon: 'i-heroicons-code-bracket',
    title: 'Real-time Collaboration',
    description: 'Code together in real-time with syntax highlighting for 100+ languages',
    color: 'text-primary',
  },
  {
    icon: 'i-heroicons-chat-bubble-left-right',
    title: 'Integrated Chat',
    description: 'Private, public, and group chats with typing indicators and notifications',
    color: 'text-accent',
  },
  {
    icon: 'i-heroicons-video-camera',
    title: 'Voice & Video',
    description: 'Built-in voice and video calling for seamless pair programming',
    color: 'text-info',
  },
  {
    icon: 'i-heroicons-document-arrow-up',
    title: 'File Sharing',
    description: 'Share files, images, and import local projects with ease',
    color: 'text-warning',
  },
  {
    icon: 'i-heroicons-lock-closed',
    title: 'Secure Rooms',
    description: 'Create private rooms with access control for your team',
    color: 'text-secondary',
  },
  {
    icon: 'i-heroicons-arrow-down-tray',
    title: 'Export Code',
    description: 'Export your collaborative work to any supported file format',
    color: 'text-success',
  },
]

// Code example for hero animation
const codeExample = `function collaborate() {
  const team = await joinRoom('dev-hub');

  team.on('code', (changes) => {
    editor.apply(changes);
    notify('Code updated!');
  });

  return { success: true };
}`

// Typing animation
const displayedCode = ref('')
const codeIndex = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    if (codeIndex.value < codeExample.length) {
      displayedCode.value += codeExample[codeIndex.value]
      codeIndex.value++
    } else {
      clearInterval(interval)
    }
  }, 30)
})

// Stats
const stats = [
  { value: '100+', label: 'Languages' },
  { value: '60+', label: 'Themes' },
  { value: 'Real-time', label: 'Sync' },
  { value: 'P2P', label: 'WebRTC' },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden py-20 lg:py-32">
      <!-- Background effects -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text content -->
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
              Real-time Pair Programming
            </div>

            <h1 class="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <span class="text-primary">Code</span> Together,
              <br />
              <span class="text-accent">Build</span> Faster
            </h1>

            <p class="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              CoFall is a real-time collaborative coding platform with integrated chat,
              voice & video calls, and file sharing. Perfect for pair programming and team collaboration.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <NuxtLink :to="loggedIn ? '/rooms' : '/auth/register'">
                <UButton size="xl" class="w-full sm:w-auto">
                  <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 mr-2" />
                  {{ loggedIn ? 'Go to Rooms' : 'Get Started Free' }}
                </UButton>
              </NuxtLink>
              <NuxtLink to="/rooms">
                <UButton variant="outline" size="xl" class="w-full sm:w-auto">
                  <UIcon name="i-heroicons-play" class="w-5 h-5 mr-2" />
                  Browse Rooms
                </UButton>
              </NuxtLink>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/50">
              <div v-for="stat in stats" :key="stat.label" class="text-center">
                <div class="text-2xl font-bold text-primary font-mono">{{ stat.value }}</div>
                <div class="text-xs text-muted-foreground">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Code preview -->
          <div class="relative">
            <div class="relative rounded-xl overflow-hidden border border-border bg-editor-bg shadow-2xl">
              <!-- Window controls -->
              <div class="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
                <div class="flex gap-1.5">
                  <div class="w-3 h-3 rounded-full bg-destructive/70"></div>
                  <div class="w-3 h-3 rounded-full bg-warning/70"></div>
                  <div class="w-3 h-3 rounded-full bg-success/70"></div>
                </div>
                <span class="text-xs text-muted-foreground font-mono ml-2">collaborate.js</span>
              </div>

              <!-- Code content -->
              <div class="p-4 font-mono text-sm leading-relaxed">
                <pre class="whitespace-pre-wrap"><code><span class="syntax-keyword">function</span> <span class="syntax-function">collaborate</span>() {
  <span class="syntax-keyword">const</span> <span class="syntax-variable">team</span> = <span class="syntax-keyword">await</span> <span class="syntax-function">joinRoom</span>(<span class="syntax-string">'dev-hub'</span>);

  <span class="syntax-variable">team</span>.<span class="syntax-function">on</span>(<span class="syntax-string">'code'</span>, (<span class="syntax-variable">changes</span>) => {
    <span class="syntax-variable">editor</span>.<span class="syntax-function">apply</span>(<span class="syntax-variable">changes</span>);
    <span class="syntax-function">notify</span>(<span class="syntax-string">'Code updated!'</span>);
  });

  <span class="syntax-keyword">return</span> { <span class="syntax-variable">success</span>: <span class="syntax-keyword">true</span> };
}</code></pre>
                <!-- Blinking cursor -->
                <span class="inline-block w-2 h-5 bg-primary animate-pulse"></span>
              </div>

              <!-- Live collaboration indicator -->
              <div class="absolute top-3 right-4 flex items-center gap-2">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </span>
                <span class="text-xs text-success">3 coding</span>
              </div>
            </div>

            <!-- Floating elements -->
            <div class="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 text-accent" />
                <span class="text-xs font-medium">Chat Active</span>
              </div>
            </div>

            <div class="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-3 shadow-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-video-camera" class="w-4 h-4 text-info" />
                <span class="text-xs font-medium">Voice On</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Everything You Need to Collaborate</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for pair programming and team collaboration,
            all in one place.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" v-auto-animate>
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="group border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
          >
            <div class="flex flex-col h-full">
              <div
                class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4 transition-colors group-hover:bg-primary/10"
                :class="feature.color"
              >
                <UIcon :name="feature.icon" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ feature.description }}</p>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border p-8 md:p-12 text-center">
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
          </div>

          <div class="relative">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Coding Together?
            </h2>
            <p class="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of developers who collaborate in real-time with CoFall.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink :to="loggedIn ? '/rooms/create' : '/auth/register'">
                <UButton size="lg">
                  <UIcon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
                  {{ loggedIn ? 'Create a Room' : 'Sign Up Free' }}
                </UButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
