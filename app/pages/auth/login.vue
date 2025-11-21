<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { valibotValidator } from '@tanstack/valibot-form-adapter'
import * as v from 'valibot'

definePageMeta({
  layout: 'default',
  middleware: 'guest',
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const isLoading = ref(false)

// Valibot schemas
const usernameSchema = v.pipe(
  v.string(),
  v.minLength(3, 'Username must be at least 3 characters')
)

const passwordSchema = v.pipe(
  v.string(),
  v.minLength(6, 'Password must be at least 6 characters')
)

// TanStack Form setup
const form = useForm({
  defaultValues: {
    username: '',
    password: '',
  },
  validatorAdapter: valibotValidator(),
  onSubmit: async ({ value }) => {
    isLoading.value = true
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: value,
      })

      toast.add({
        title: 'Welcome back!',
        description: 'You have been logged in successfully.',
        color: 'success',
      })

      const redirect = route.query.redirect as string
      router.push(redirect || '/rooms')
    } catch (error: any) {
      toast.add({
        title: 'Login failed',
        description: error.data?.message || 'Invalid credentials',
        color: 'error',
      })
    } finally {
      isLoading.value = false
    }
  },
})

// Check for OAuth errors
onMounted(() => {
  if (route.query.error === 'github') {
    toast.add({
      title: 'GitHub login failed',
      description: 'There was an error logging in with GitHub. Please try again.',
      color: 'error',
    })
  }
})
</script>

<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
          <UIcon name="i-heroicons-code-bracket" class="w-8 h-8" />
        </div>
        <h1 class="text-3xl font-bold mb-2">Welcome back</h1>
        <p class="text-muted-foreground">
          Sign in to continue coding with your team
        </p>
      </div>

      <!-- Login Form -->
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
                  placeholder="Enter your username"
                  icon="i-heroicons-user"
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
                  placeholder="Enter your password"
                  icon="i-heroicons-lock-closed"
                  :disabled="isLoading"
                />
              </UFormField>
            </template>
          </form.Field>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2">
              <UCheckbox />
              <span class="text-muted-foreground">Remember me</span>
            </label>
            <NuxtLink to="/auth/forgot-password" class="text-primary hover:underline">
              Forgot password?
            </NuxtLink>
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
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
                Sign In
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

        <!-- Demo credentials hint -->
        <div class="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <p class="text-xs text-muted-foreground text-center">
            <span class="font-mono text-primary">Demo:</span> username: <code class="text-accent">demo</code>, password: <code class="text-accent">demo123</code>
          </p>
        </div>
      </UCard>

      <!-- Sign up link -->
      <p class="text-center mt-6 text-sm text-muted-foreground">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary hover:underline font-medium">
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
