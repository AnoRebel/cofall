export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        id: user.id.toString(),
        username: user.login,
        email: user.email || '',
        avatar: user.avatar_url,
      },
      loggedInAt: Date.now(),
    })
    return sendRedirect(event, '/rooms')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=github')
  },
})
