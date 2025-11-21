<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { valibotValidator } from '@tanstack/valibot-form-adapter'
import * as v from 'valibot'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const router = useRouter()
const toast = useToast()

const isLoading = ref(false)

// Valibot schemas
const usernameSchema = v.pipe(
  v.string(),
  v.minLength(3, 'Username must be at least 3 characters'),
  v.maxLength(50, 'Username must be less than 50 characters'),
  v.regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens')
)

const emailSchema = v.pipe(
  v.string(),
  v.email('Invalid email address')
)

const passwordSchema = v.pipe(
  v.string(),
  v.minLength(6, 'Password must be at least 6 characters'),
  v.regex(/[A-Za-z]/, 'Password must contain a letter'),
  v.regex(/[0-9]/, 'Password must contain a number')
)

// TanStack Form setup
const form = useForm({
  defaultValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  validatorAdapter: valibotValidator(),
  onSubmit: async ({ value }) => {
    isLoading.value = true
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          username: value.username,
          email: value.email,
          password: value.password,
        },
      })

      toast.add({
        title: 'Account created!',
        description: 'Welcome to CoFall. Start collaborating now!',
        color: 'success',
      })

      router.push('/rooms')
    } catch (error: any) {
      toast.add({
        title: 'Registration failed',
        description: error.data?.message || 'An error occurred',
        color: 'error',
      })
    } finally {
      isLoading.value = false
    }
  },
})

// Password strength indicator
const passwordValue = computed(() => form.state.values.password)

const passwordStrength = computed(() => {
  const pwd = passwordValue.value
  if (!pwd) return { score: 0, label: '', color: '' }

  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['', 'bg-destructive', 'bg-warning', 'bg-warning', 'bg-success', 'bg-accent']

  return { score, label: labels[score], color: colors[score] }
})
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-4">
          <UIcon name="i-heroicons-user-plus" class="w-8 h-8" />
        </div>
        <h1 class="text-3xl font-bold mb-2">Create account</h1>
        <p class="text-muted-foreground">
          Join the collaborative coding community
        </p>
      </div>

      <!-- Register Form -->
      <UCard class="border-border/50">
        <form @submit.prevent.stop="form.handleSubmit()" class="space-y-4">
          <!-- Username field -->
          <form.Field name="username" :validators="{ onChange: usernameSchema }">
            <template #default="{ field, state }">
              <UFormField
                label="Username"
                :error="state.meta.errors?.[0]"
              >
                <UInput
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange"
                  @blur="field.handleBlur"
                  placeholder="Choose a username"
                  icon="i-heroicons-at-symbol"
                  :disabled="isLoading"
                />
              </UFormField>
            </template>
          </form.Field>

          <!-- Email field -->
          <form.Field name="email" :validators="{ onChange: emailSchema }">
            <template #default="{ field, state }">
              <UFormField
                label="Email"
                :error="state.meta.errors?.[0]"
              >
                <UInput
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange"
                  @blur="field.handleBlur"
                  type="email"
                  placeholder="Enter your email"
                  icon="i-heroicons-envelope"
                  :disabled="isLoading"
                />
              </UFormField>
            </template>
          </form.Field>

          <!-- Password field -->
          <form.Field name="password" :validators="{ onChange: passwordSchema }">
            <template #default="{ field, state }">
              <UFormField
                label="Password"
                :error="state.meta.errors?.[0]"
              >
                <UInput
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange"
                  @blur="field.handleBlur"
                  type="password"
                  placeholder="Create a password"
                  icon="i-heroicons-lock-closed"
                  :disabled="isLoading"
                />
                <!-- Password strength indicator -->
                <div v-if="passwordValue" class="mt-2">
                  <div class="flex gap-1 mb-1">
                    <div
                      v-for="i in 5"
                      :key="i"
                      class="h-1 flex-1 rounded-full bg-muted"
                    >
                      <div
                        class="h-full rounded-full transition-all duration-300"
                        :class="i <= passwordStrength.score ? passwordStrength.color : ''"
                      ></div>
                    </div>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {{ passwordStrength.label }}
                  </p>
                </div>
              </UFormField>
            </template>
          </form.Field>

          <!-- Confirm Password field -->
          <form.Field
            name="confirmPassword"
            :validators="{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                if (value !== fieldApi.form.getFieldValue('password')) {
                  return 'Passwords do not match'
                }
                return undefined
              },
            }"
          >
            <template #default="{ field, state }">
              <UFormField
                label="Confirm Password"
                :error="state.meta.errors?.[0]"
              >
                <UInput
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange"
                  @blur="field.handleBlur"
                  type="password"
                  placeholder="Confirm your password"
                  icon="i-heroicons-lock-closed"
                  :disabled="isLoading"
                />
              </UFormField>
            </template>
          </form.Field>

          <div class="flex items-start gap-2">
            <UCheckbox id="terms" class="mt-0.5" />
            <label for="terms" class="text-sm text-muted-foreground">
              I agree to the
              <NuxtLink to="/terms" class="text-primary hover:underline">
                Terms of Service
              </NuxtLink>
              and
              <NuxtLink to="/privacy" class="text-primary hover:underline">
                Privacy Policy
              </NuxtLink>
            </label>
          </div>

          <form.Subscribe>
            <template #default="{ canSubmit }">
              <UButton
                type="submit"
                class="w-full"
                size="lg"
                :loading="isLoading"
                :disabled="!canSubmit || isLoading"
              >
                <UIcon name="i-heroicons-rocket-launch" class="w-4 h-4 mr-2" />
                Create Account
              </UButton>
            </template>
          </form.Subscribe>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <!-- OAuth -->
        <UButton
          variant="outline"
          class="w-full"
          size="lg"
          as="a"
          href="/api/auth/github"
        >
          <UIcon name="i-simple-icons-github" class="w-5 h-5 mr-2" />
          GitHub
        </UButton>
      </UCard>

      <!-- Sign in link -->
      <p class="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary hover:underline font-medium">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
