<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { valibotValidator } from '@tanstack/valibot-form-adapter'
import * as v from 'valibot'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { loggedIn, user } = useUserSession()

// Fetch rooms
const { data: rooms, pending, error, refresh } = await useFetch('/api/rooms')

// Create room modal
const showCreateModal = ref(false)
const isCreating = ref(false)

// Room name schema
const roomNameSchema = v.pipe(
  v.string(),
  v.minLength(3, 'Room name must be at least 3 characters'),
  v.maxLength(50, 'Room name must be less than 50 characters'),
  v.regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens')
)

// Create room form
const createForm = useForm({
  defaultValues: {
    name: '',
    type: 'public' as 'public' | 'private',
    language: 'javascript',
  },
  validatorAdapter: valibotValidator(),
  onSubmit: async ({ value }) => {
    isCreating.value = true
    try {
      // Navigate to room (room will be created on join via signaling server)
      router.push(`/rooms/${value.name}`)
    } finally {
      isCreating.value = false
      showCreateModal.value = false
    }
  },
})

// Join room handler
const joinRoom = (roomName: string) => {
  if (!loggedIn.value) {
    router.push(`/auth/login?redirect=/rooms/${roomName}`)
    return
  }
  router.push(`/rooms/${roomName}`)
}

// Language options
const languageOptions = [
  { value: 'javascript', label: 'JavaScript', icon: 'i-simple-icons-javascript' },
  { value: 'typescript', label: 'TypeScript', icon: 'i-simple-icons-typescript' },
  { value: 'python', label: 'Python', icon: 'i-simple-icons-python' },
  { value: 'java', label: 'Java', icon: 'i-simple-icons-java' },
  { value: 'cpp', label: 'C++', icon: 'i-simple-icons-cplusplus' },
  { value: 'go', label: 'Go', icon: 'i-simple-icons-go' },
  { value: 'rust', label: 'Rust', icon: 'i-simple-icons-rust' },
  { value: 'html', label: 'HTML', icon: 'i-simple-icons-html5' },
  { value: 'css', label: 'CSS', icon: 'i-simple-icons-css3' },
  { value: 'php', label: 'PHP', icon: 'i-simple-icons-php' },
]

// Get language icon
const getLanguageIcon = (lang: string) => {
  const option = languageOptions.find(o => o.value === lang)
  return option?.icon || 'i-heroicons-code-bracket'
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">Collaboration Rooms</h1>
        <p class="text-muted-foreground">
          Join an existing room or create your own to start coding together
        </p>
      </div>

      <div class="flex items-center gap-3">
        <UButton
          variant="outline"
          @click="refresh"
          :loading="pending"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
          Refresh
        </UButton>

        <UButton @click="showCreateModal = true">
          <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
          Create Room
        </UButton>
      </div>
    </div>

    <!-- Error state -->
    <UCard v-if="error" class="border-destructive/50 bg-destructive/10 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-destructive" />
        <div>
          <p class="font-medium text-destructive">Failed to load rooms</p>
          <p class="text-sm text-muted-foreground">{{ error.message }}</p>
        </div>
      </div>
    </UCard>

    <!-- Rooms grid -->
    <div v-if="rooms && rooms.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4" v-auto-animate>
      <UCard
        v-for="room in rooms"
        :key="room.name"
        class="group border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer"
        @click="joinRoom(room.name)"
      >
        <div class="flex flex-col h-full">
          <!-- Room header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <UIcon :name="getLanguageIcon(room.language)" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-semibold group-hover:text-primary transition-colors">
                  {{ room.name }}
                </h3>
                <p class="text-xs text-muted-foreground capitalize">
                  {{ room.language || 'javascript' }}
                </p>
              </div>
            </div>

            <!-- Online indicator -->
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span class="text-xs text-muted-foreground">{{ room.users }} online</span>
            </div>
          </div>

          <!-- Room actions -->
          <div class="mt-auto pt-4 border-t border-border/50">
            <UButton
              variant="ghost"
              size="sm"
              class="w-full group-hover:bg-primary/10 group-hover:text-primary"
            >
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 mr-2" />
              Join Room
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty state -->
    <UCard v-else-if="!pending" class="border-dashed">
      <div class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
          <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold mb-2">No rooms available</h3>
        <p class="text-muted-foreground mb-4">
          Be the first to create a collaboration room
        </p>
        <UButton @click="showCreateModal = true">
          <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
          Create Room
        </UButton>
      </div>
    </UCard>

    <!-- Loading state -->
    <div v-if="pending" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <USkeleton v-for="i in 6" :key="i" class="h-40 rounded-xl" />
    </div>

    <!-- Create Room Modal -->
    <UModal v-model:open="showCreateModal">
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-semibold">Create Room</h3>
              <p class="text-sm text-muted-foreground">Start a new collaboration space</p>
            </div>
          </div>
        </template>

        <form @submit.prevent.stop="createForm.handleSubmit()" class="space-y-4">
          <!-- Room name -->
          <createForm.Field name="name" :validators="{ onChange: roomNameSchema }">
            <template #default="{ field, state }">
              <UFormField
                label="Room Name"
                :error="state.meta.errors?.[0]"
              >
                <UInput
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange"
                  @blur="field.handleBlur"
                  placeholder="my-awesome-project"
                  icon="i-heroicons-hashtag"
                />
              </UFormField>
            </template>
          </createForm.Field>

          <!-- Language -->
          <createForm.Field name="language">
            <template #default="{ field }">
              <UFormField label="Primary Language">
                <USelectMenu
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange"
                  :items="languageOptions"
                  value-key="value"
                />
              </UFormField>
            </template>
          </createForm.Field>

          <!-- Room type -->
          <createForm.Field name="type">
            <template #default="{ field }">
              <UFormField label="Room Type">
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="field.handleChange('public')"
                    class="flex items-center gap-2 p-3 rounded-lg border transition-all"
                    :class="field.state.value === 'public' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'"
                  >
                    <UIcon name="i-heroicons-globe-alt" class="w-4 h-4" />
                    <span class="text-sm font-medium">Public</span>
                  </button>
                  <button
                    type="button"
                    @click="field.handleChange('private')"
                    class="flex items-center gap-2 p-3 rounded-lg border transition-all"
                    :class="field.state.value === 'private' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'"
                  >
                    <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
                    <span class="text-sm font-medium">Private</span>
                  </button>
                </div>
              </UFormField>
            </template>
          </createForm.Field>

          <div class="flex justify-end gap-2 pt-4">
            <UButton variant="ghost" @click="showCreateModal = false">
              Cancel
            </UButton>
            <createForm.Subscribe>
              <template #default="{ canSubmit }">
                <UButton
                  type="submit"
                  :loading="isCreating"
                  :disabled="!canSubmit || isCreating"
                >
                  Create Room
                </UButton>
              </template>
            </createForm.Subscribe>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
