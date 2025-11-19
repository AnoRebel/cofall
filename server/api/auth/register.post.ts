import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: result.error.flatten(),
    })
  }

  const { username, email, password } = result.data

  // In a real app, you'd:
  // 1. Check if user already exists
  // 2. Hash the password
  // 3. Store in database

  // Generate a unique ID (in real app, this would come from DB)
  const userId = crypto.randomUUID()

  // Create user session
  await setUserSession(event, {
    user: {
      id: userId,
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
    },
    loggedInAt: Date.now(),
  })

  return {
    success: true,
    message: 'Account created successfully',
  }
})
