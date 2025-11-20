<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Projects</h1>
          <p class="text-muted mt-1">Manage your collaborative projects</p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          size="lg"
          @click="showCreateModal = true"
        >
          New Project
        </UButton>
      </div>

      <!-- Filters -->
      <div class="flex gap-4 mb-6">
        <USelectMenu
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="Filter by status"
          class="w-48"
        />
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search projects..."
          class="flex-1"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        :title="error"
      />

      <!-- Empty State -->
      <div
        v-else-if="filteredProjects.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📁</div>
        <h3 class="text-xl font-semibold mb-2">No projects found</h3>
        <p class="text-muted mb-6">
          {{ searchQuery ? 'Try adjusting your search' : 'Create your first project to get started' }}
        </p>
        <UButton
          v-if="!searchQuery"
          @click="showCreateModal = true"
        >
          Create Project
        </UButton>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="project in filteredProjects"
          :key="project.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateTo(`/projects/${project.id}`)"
        >
          <template #header>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold mb-1">{{ project.name }}</h3>
                <p class="text-sm text-muted">by {{ project.creator }}</p>
              </div>
              <UBadge
                :color="getStatusColor(project.status)"
                variant="subtle"
              >
                {{ project.status }}
              </UBadge>
            </div>
          </template>

          <p v-if="project.description" class="text-muted line-clamp-2">
            {{ project.description }}
          </p>

          <template #footer>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-4">
                <div
                  v-if="project.tasks?.length"
                  class="flex items-center gap-1 text-muted"
                >
                  <UIcon name="i-heroicons-check-circle" />
                  <span>{{ project.tasks.length }} tasks</span>
                </div>
                <div
                  v-if="project.issues?.length"
                  class="flex items-center gap-1 text-muted"
                >
                  <UIcon name="i-heroicons-exclamation-circle" />
                  <span>{{ project.issues.length }} issues</span>
                </div>
              </div>
              <div class="text-muted">
                {{ formatDate(project.updatedAt) }}
              </div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Create Project Modal -->
      <UModal v-model="showCreateModal">
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">Create New Project</h3>
          </template>

          <form @submit.prevent="handleCreateProject" class="space-y-4">
            <UFormGroup label="Project Name" required>
              <UInput
                v-model="newProject.name"
                placeholder="Enter project name"
                required
              />
            </UFormGroup>

            <UFormGroup label="Description">
              <UTextarea
                v-model="newProject.description"
                placeholder="Enter project description"
                rows="3"
              />
            </UFormGroup>

            <UFormGroup label="Status">
              <USelectMenu
                v-model="newProject.status"
                :options="['active', 'archived', 'completed']"
              />
            </UFormGroup>

            <div class="flex justify-end gap-3">
              <UButton
                color="gray"
                variant="ghost"
                @click="showCreateModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="creating"
              >
                Create Project
              </UButton>
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { projects, loading, error, fetchProjects, createProject } = useProjects()
const toast = useToast()

// State
const showCreateModal = ref(false)
const creating = ref(false)
const statusFilter = ref<string>('')
const searchQuery = ref('')

const newProject = ref({
  name: '',
  description: '',
  status: 'active' as const,
  creator: '',
})

// Options
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Completed', value: 'completed' },
]

// Computed
const filteredProjects = computed(() => {
  let filtered = projects.value

  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.creator.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'active':
      return 'green'
    case 'archived':
      return 'gray'
    case 'completed':
      return 'blue'
    default:
      return 'gray'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const handleCreateProject = async () => {
  const { user } = useUserSession()
  if (!user.value) return

  creating.value = true
  try {
    newProject.value.creator = user.value.username

    await createProject(newProject.value)

    toast.add({
      title: 'Project created',
      description: 'Your project has been created successfully',
      color: 'green',
    })

    showCreateModal.value = false
    newProject.value = {
      name: '',
      description: '',
      status: 'active',
      creator: '',
    }
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to create project',
      color: 'red',
    })
  } finally {
    creating.value = false
  }
}

// Load projects on mount
onMounted(() => {
  fetchProjects()
})
</script>
