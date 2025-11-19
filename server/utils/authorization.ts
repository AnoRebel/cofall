import type { H3Event } from 'h3'
import { defineAbility } from '#imports'

export const resolveUserAbilities = defineAbility((event: H3Event) => {
  const session = event.context.session

  return {
    // Room abilities
    'room:create': () => !!session?.user,
    'room:join': () => !!session?.user,
    'room:edit': (room: { ownerId: string }) =>
      session?.user?.id === room.ownerId,
    'room:delete': (room: { ownerId: string }) =>
      session?.user?.id === room.ownerId,

    // Chat abilities
    'chat:send': () => !!session?.user,
    'chat:private': () => !!session?.user,

    // File abilities
    'file:upload': () => !!session?.user,
    'file:download': () => !!session?.user,

    // Admin abilities (extend as needed)
    'admin:access': () => false, // Implement admin check
  }
})
