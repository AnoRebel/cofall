import type { Task } from '#imports'

export const useTasks = () => {
  const config = useRuntimeConfig()
  const signalingUrl = config.public.signalingServer || 'http://localhost:3001'

  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all tasks
  const fetchTasks = async (params?: {
    status?: 'todo' | 'in_progress' | 'review' | 'done'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    projectId?: number
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.priority) queryParams.append('priority', params.priority)
      if (params?.projectId) queryParams.append('projectId', params.projectId.toString())
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await $fetch<ApiResponse<Task[]>>(
        `${signalingUrl}/api/tasks${query}`
      )

      if (response.success && response.data) {
        tasks.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tasks'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single task by ID
  const fetchTask = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Task>>(
        `${signalingUrl}/api/tasks/${id}`
      )

      if (response.success && response.data) {
        currentTask.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch task'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new task
  const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Task>>(
        `${signalingUrl}/api/tasks`,
        {
          method: 'POST',
          body: data,
        }
      )

      if (response.success && response.data) {
        tasks.value.push(response.data)
        currentTask.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to create task'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update task
  const updateTask = async (id: number, data: Partial<Task>) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Task>>(
        `${signalingUrl}/api/tasks/${id}`,
        {
          method: 'PATCH',
          body: data,
        }
      )

      if (response.success && response.data) {
        const index = tasks.value.findIndex(t => t.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data
        }
        if (currentTask.value?.id === id) {
          currentTask.value = response.data
        }
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to update task'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete task
  const deleteTask = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(
        `${signalingUrl}/api/tasks/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.success) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        if (currentTask.value?.id === id) {
          currentTask.value = null
        }
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to delete task'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update task status
  const updateTaskStatus = async (id: number, status: Task['status']) => {
    return await updateTask(id, { status })
  }

  // Update task priority
  const updateTaskPriority = async (id: number, priority: Task['priority']) => {
    return await updateTask(id, { priority })
  }

  // Assign users to task
  const assignUsers = async (id: number, userIds: string[]) => {
    return await updateTask(id, { assignedTo: userIds })
  }

  // Update due date
  const updateDueDate = async (id: number, dueDate: string) => {
    return await updateTask(id, { dueDate })
  }

  // Group tasks by status
  const tasksByStatus = computed(() => {
    return {
      todo: tasks.value.filter(t => t.status === 'todo'),
      in_progress: tasks.value.filter(t => t.status === 'in_progress'),
      review: tasks.value.filter(t => t.status === 'review'),
      done: tasks.value.filter(t => t.status === 'done'),
    }
  })

  // Group tasks by priority
  const tasksByPriority = computed(() => {
    return {
      low: tasks.value.filter(t => t.priority === 'low'),
      medium: tasks.value.filter(t => t.priority === 'medium'),
      high: tasks.value.filter(t => t.priority === 'high'),
      urgent: tasks.value.filter(t => t.priority === 'urgent'),
    }
  })

  // Get overdue tasks
  const overdueTasks = computed(() => {
    const now = new Date()
    return tasks.value.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    )
  })

  return {
    // State
    tasks: readonly(tasks),
    currentTask: readonly(currentTask),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    tasksByStatus,
    tasksByPriority,
    overdueTasks,

    // Methods
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    assignUsers,
    updateDueDate,
  }
}
