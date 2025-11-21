import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: result.error.flatten(),
    })
  }

  const { username, password } = result.data

  // In a real app, you'd verify against a database
  // This is a demo implementation
  if (username === 'demo' && password === 'demo123') {
    await setUserSession(event, {
      user: {
        id: '1',
        username,
        email: `${username}@cofall.dev`,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
      },
      loggedInAt: Date.now(),
    })

    return { success: true }
  }

  throw createError({
    statusCode: 401,
    message: 'Invalid credentials',
  })
})
