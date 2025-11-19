export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Fetch rooms from signaling server
    const response = await $fetch<{ rooms: any[] }>(`${config.public.signalingServer}/info`)
    return response.rooms || []
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    // Return mock data if signaling server is unavailable
    return [
      {
        name: 'javascript-study',
        users: 3,
        language: 'javascript',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'python-collab',
        users: 2,
        language: 'python',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'web-dev-team',
        users: 5,
        language: 'html',
        createdAt: new Date().toISOString(),
      },
    ]
  }
})
