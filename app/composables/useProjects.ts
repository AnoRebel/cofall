import type { Project } from '#imports'

export const useProjects = () => {
  const config = useRuntimeConfig()
  const signalingUrl = config.public.signalingServer || 'http://localhost:3001'

  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all projects
  const fetchProjects = async (params?: {
    status?: 'active' | 'archived' | 'completed'
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await $fetch<ApiResponse<Project[]>>(
        `${signalingUrl}/api/projects${query}`
      )

      if (response.success && response.data) {
        projects.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch projects'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single project by ID
  const fetchProject = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Project>>(
        `${signalingUrl}/api/projects/${id}`
      )

      if (response.success && response.data) {
        currentProject.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new project
  const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Project>>(
        `${signalingUrl}/api/projects`,
        {
          method: 'POST',
          body: data,
        }
      )

      if (response.success && response.data) {
        projects.value.push(response.data)
        currentProject.value = response.data
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to create project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update project
  const updateProject = async (id: number, data: Partial<Project>) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Project>>(
        `${signalingUrl}/api/projects/${id}`,
        {
          method: 'PATCH',
          body: data,
        }
      )

      if (response.success && response.data) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value[index] = response.data
        }
        if (currentProject.value?.id === id) {
          currentProject.value = response.data
        }
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to update project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete project
  const deleteProject = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<void>>(
        `${signalingUrl}/api/projects/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.success) {
        projects.value = projects.value.filter(p => p.id !== id)
        if (currentProject.value?.id === id) {
          currentProject.value = null
        }
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to delete project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Archive project
  const archiveProject = async (id: number) => {
    return await updateProject(id, { status: 'archived' })
  }

  // Complete project
  const completeProject = async (id: number) => {
    return await updateProject(id, { status: 'completed' })
  }

  // Reactivate project
  const reactivateProject = async (id: number) => {
    return await updateProject(id, { status: 'active' })
  }

  return {
    // State
    projects: readonly(projects),
    currentProject: readonly(currentProject),
    loading: readonly(loading),
    error: readonly(error),

    // Methods
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    completeProject,
    reactivateProject,
  }
}
