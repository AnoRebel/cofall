export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
})
