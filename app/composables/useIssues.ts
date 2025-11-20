import type { Issue } from '#imports'

export const useIssues = () => {
  const config = useRuntimeConfig()
  const signalingUrl = config.public.signalingServer || 'http://localhost:3001'

  // State
  const issues = ref<Issue[]>([])
  const currentIssue = ref<Issue | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all issues
  const fetchIssues = async (params?: {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    parent?: 'project' | 'task'
    projectId?: number
    taskId?: number
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.priority) queryParams.append('priority', params.priority)
      if (params?.parent) queryParams.append('parent', params.parent)
      if (params?.projectId) queryParams.append('projectId', params.projectId.toString())
      if (params?.taskId) queryParams.append('taskId', params.taskId.toString())
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await $fetch<ApiResponse<Issue[]>>(
        `${signalingUrl}/api/issues${query}`
      )

      if (response.success && response.data) {
        issues.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch issues'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single issue by ID
  const fetchIssue = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Issue>>(
        `${signalingUrl}/api/issues/${id}`
      )

      if (response.success && response.data) {
        currentIssue.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch issue'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new issue
  const createIssue = async (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Issue>>(
        `${signalingUrl}/api/issues`,
        {
          method: 'POST',
          body: data,
        }
      )

      if (response.success && response.data) {
        issues.value.push(response.data)
        currentIssue.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to create issue'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update issue
  const updateIssue = async (id: number, data: Partial<Issue>) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Issue>>(
        `${signalingUrl}/api/issues/${id}`,
        {
          method: 'PATCH',
          body: data,
        }
      )

      if (response.success && response.data) {
        const index = issues.value.findIndex(i => i.id === id)
        if (index !== -1) {
          issues.value[index] = response.data
        }
        if (currentIssue.value?.id === id) {
          currentIssue.value = response.data
        }
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to update issue'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete issue
  const deleteIssue = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(
        `${signalingUrl}/api/issues/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.success) {
        issues.value = issues.value.filter(i => i.id !== id)
        if (currentIssue.value?.id === id) {
          currentIssue.value = null
        }
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to delete issue'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update issue status
  const updateIssueStatus = async (id: number, status: Issue['status']) => {
    return await updateIssue(id, { status })
  }

  // Update issue priority
  const updateIssuePriority = async (id: number, priority: Issue['priority']) => {
    return await updateIssue(id, { priority })
  }

  // Resolve issue
  const resolveIssue = async (id: number) => {
    return await updateIssueStatus(id, 'resolved')
  }

  // Close issue
  const closeIssue = async (id: number) => {
    return await updateIssueStatus(id, 'closed')
  }

  // Reopen issue
  const reopenIssue = async (id: number) => {
    return await updateIssueStatus(id, 'open')
  }

  // Group issues by status
  const issuesByStatus = computed(() => {
    return {
      open: issues.value.filter(i => i.status === 'open'),
      in_progress: issues.value.filter(i => i.status === 'in_progress'),
      resolved: issues.value.filter(i => i.status === 'resolved'),
      closed: issues.value.filter(i => i.status === 'closed'),
    }
  })

  // Group issues by priority
  const issuesByPriority = computed(() => {
    return {
      low: issues.value.filter(i => i.priority === 'low'),
      medium: issues.value.filter(i => i.priority === 'medium'),
      high: issues.value.filter(i => i.priority === 'high'),
      critical: issues.value.filter(i => i.priority === 'critical'),
    }
  })

  // Group issues by parent
  const issuesByParent = computed(() => {
    return {
      project: issues.value.filter(i => i.parent === 'project'),
      task: issues.value.filter(i => i.parent === 'task'),
    }
  })

  // Get critical open issues
  const criticalIssues = computed(() => {
    return issues.value.filter(i =>
      i.priority === 'critical' && (i.status === 'open' || i.status === 'in_progress')
    )
  })

  return {
    // State
    issues: readonly(issues),
    currentIssue: readonly(currentIssue),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    issuesByStatus,
    issuesByPriority,
    issuesByParent,
    criticalIssues,

    // Methods
    fetchIssues,
    fetchIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    updateIssueStatus,
    updateIssuePriority,
    resolveIssue,
    closeIssue,
    reopenIssue,
  }
}
