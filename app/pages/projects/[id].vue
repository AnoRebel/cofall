<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <SkeletonCard />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        :title="error"
        class="mb-6"
      />

      <!-- Project Details -->
      <div v-else-if="currentProject" class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                @click="navigateTo('/projects')"
              />
              <h1 class="text-3xl font-bold">{{ currentProject.name }}</h1>
              <UBadge
                :color="getStatusColor(currentProject.status)"
                variant="subtle"
                size="lg"
              >
                {{ currentProject.status }}
              </UBadge>
            </div>
            <p class="text-muted ml-14">Created by {{ currentProject.creator }}</p>
          </div>

          <UDropdown :items="projectActions">
            <UButton
              icon="i-heroicons-ellipsis-horizontal"
              color="gray"
              variant="ghost"
            />
          </UDropdown>
        </div>

        <!-- Description -->
        <UCard v-if="currentProject.description">
          <template #header>
            <h2 class="text-lg font-semibold">Description</h2>
          </template>
          <p class="text-muted">{{ currentProject.description }}</p>
        </UCard>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-3 bg-primary/10 rounded-lg">
                <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ currentProject.tasks?.length || 0 }}</p>
                <p class="text-sm text-muted">Tasks</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-3 bg-orange-500/10 rounded-lg">
                <UIcon name="i-heroicons-exclamation-circle" class="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ currentProject.issues?.length || 0 }}</p>
                <p class="text-sm text-muted">Issues</p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-500/10 rounded-lg">
                <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ currentProject.owners?.length || 0 }}</p>
                <p class="text-sm text-muted">Team Members</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Tasks Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Tasks</h2>
              <UButton
                size="sm"
                @click="navigateTo(`/tasks?project=${route.params.id}`)"
              >
                View All
              </UButton>
            </div>
          </template>

          <div v-if="currentProject.tasks?.length" class="space-y-3">
            <div
              v-for="task in currentProject.tasks.slice(0, 5)"
              :key="task.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              @click="navigateTo(`/tasks/${task.id}`)"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  :name="getTaskStatusIcon(task.status)"
                  :class="getTaskStatusColor(task.status)"
                />
                <div>
                  <p class="font-medium">{{ task.name }}</p>
                  <p v-if="task.description" class="text-sm text-muted line-clamp-1">
                    {{ task.description }}
                  </p>
                </div>
              </div>
              <UBadge
                v-if="task.priority"
                :color="getPriorityColor(task.priority)"
                variant="subtle"
              >
                {{ task.priority }}
              </UBadge>
            </div>
          </div>
          <div v-else class="text-center py-8 text-muted">
            No tasks yet
          </div>
        </UCard>

        <!-- Issues Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Issues</h2>
              <UButton
                size="sm"
                @click="navigateTo(`/issues?project=${route.params.id}`)"
              >
                View All
              </UButton>
            </div>
          </template>

          <div v-if="currentProject.issues?.length" class="space-y-3">
            <div
              v-for="issue in currentProject.issues.slice(0, 5)"
              :key="issue.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              @click="navigateTo(`/issues/${issue.id}`)"
            >
              <div class="flex-1">
                <p class="font-medium">{{ issue.title }}</p>
                <p class="text-sm text-muted line-clamp-1">{{ issue.description }}</p>
              </div>
              <div class="flex items-center gap-2">
                <UBadge
                  :color="getIssueStatusColor(issue.status)"
                  variant="subtle"
                >
                  {{ issue.status }}
                </UBadge>
                <UBadge
                  v-if="issue.priority"
                  :color="getPriorityColor(issue.priority)"
                  variant="subtle"
                >
                  {{ issue.priority }}
                </UBadge>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-muted">
            No issues reported
          </div>
        </UCard>

        <!-- Metadata -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Project Information</h2>
          </template>
          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-muted">Created</dt>
              <dd class="font-medium">{{ formatDate(currentProject.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted">Last Updated</dt>
              <dd class="font-medium">{{ formatDate(currentProject.updatedAt) }}</dd>
            </div>
          </dl>
        </UCard>
      </div>

      <!-- Edit Modal -->
      <UModal v-model="showEditModal">
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">Edit Project</h3>
          </template>

          <form @submit.prevent="handleUpdateProject" class="space-y-4">
            <UFormGroup label="Project Name" required>
              <UInput
                v-model="editForm.name"
                placeholder="Enter project name"
                required
              />
            </UFormGroup>

            <UFormGroup label="Description">
              <UTextarea
                v-model="editForm.description"
                placeholder="Enter project description"
                rows="3"
              />
            </UFormGroup>

            <UFormGroup label="Status">
              <USelectMenu
                v-model="editForm.status"
                :options="['active', 'archived', 'completed']"
              />
            </UFormGroup>

            <div class="flex justify-end gap-3">
              <UButton
                color="gray"
                variant="ghost"
                @click="showEditModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="updating"
              >
                Update Project
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

const route = useRoute()
const toast = useToast()
const { currentProject, loading, error, fetchProject, updateProject, deleteProject } = useProjects()

// State
const showEditModal = ref(false)
const updating = ref(false)
const editForm = ref({
  name: '',
  description: '',
  status: 'active' as const,
})

// Actions
const projectActions = computed(() => [[
  {
    label: 'Edit',
    icon: 'i-heroicons-pencil-square',
    click: () => {
      if (currentProject.value) {
        editForm.value = {
          name: currentProject.value.name,
          description: currentProject.value.description || '',
          status: currentProject.value.status || 'active',
        }
        showEditModal.value = true
      }
    },
  },
  {
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: async () => {
      if (confirm('Are you sure you want to delete this project?')) {
        try {
          await deleteProject(Number(route.params.id))
          toast.add({
            title: 'Project deleted',
            color: 'green',
          })
          navigateTo('/projects')
        } catch (err: any) {
          toast.add({
            title: 'Error',
            description: err.message,
            color: 'red',
          })
        }
      }
    },
  },
]])

// Methods
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'active': return 'green'
    case 'archived': return 'gray'
    case 'completed': return 'blue'
    default: return 'gray'
  }
}

const getTaskStatusIcon = (status?: string) => {
  switch (status) {
    case 'done': return 'i-heroicons-check-circle'
    case 'in_progress': return 'i-heroicons-arrow-path'
    case 'review': return 'i-heroicons-eye'
    default: return 'i-heroicons-clock'
  }
}

const getTaskStatusColor = (status?: string) => {
  switch (status) {
    case 'done': return 'text-green-500'
    case 'in_progress': return 'text-blue-500'
    case 'review': return 'text-yellow-500'
    default: return 'text-gray-500'
  }
}

const getIssueStatusColor = (status?: string) => {
  switch (status) {
    case 'open': return 'red'
    case 'in_progress': return 'yellow'
    case 'resolved': return 'green'
    case 'closed': return 'gray'
    default: return 'gray'
  }
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent':
    case 'critical': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'gray'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleUpdateProject = async () => {
  updating.value = true
  try {
    await updateProject(Number(route.params.id), editForm.value)
    toast.add({
      title: 'Project updated',
      color: 'green',
    })
    showEditModal.value = false
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'red',
    })
  } finally {
    updating.value = false
  }
}

// Load project on mount
onMounted(() => {
  fetchProject(Number(route.params.id))
})
</script>
