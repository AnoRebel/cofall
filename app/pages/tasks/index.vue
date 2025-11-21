<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Tasks</h1>
          <p class="text-muted mt-1">Track and manage your work</p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          size="lg"
          @click="showCreateModal = true"
        >
          New Task
        </UButton>
      </div>

      <!-- View Toggle -->
      <div class="flex items-center gap-4 mb-6">
        <UButtonGroup>
          <UButton
            :variant="view === 'board' ? 'solid' : 'ghost'"
            @click="view = 'board'"
          >
            Board
          </UButton>
          <UButton
            :variant="view === 'list' ? 'solid' : 'ghost'"
            @click="view = 'list'"
          >
            List
          </UButton>
        </UButtonGroup>

        <USelectMenu
          v-model="priorityFilter"
          :options="priorityOptions"
          placeholder="Filter by priority"
          class="w-48"
        />

        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search tasks..."
          class="flex-1"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading">
        <SkeletonCard v-for="i in 4" :key="i" class="mb-4" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        :title="error"
      />

      <!-- Kanban Board View -->
      <div v-else-if="view === 'board'" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KanbanColumn
          v-for="(statusTasks, statusKey) in tasksByStatus"
          :key="statusKey"
          :status-key="String(statusKey)"
          :tasks="statusTasks"
          @task-dropped="handleTaskDrop"
          @task-click="(task) => navigateTo(`/tasks/${task.id}`)"
        />
      </div>

      <!-- List View -->
      <div v-else class="space-y-3">
        <UCard
          v-for="task in filteredTasks"
          :key="task.id"
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="navigateTo(`/tasks/${task.id}`)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <UIcon
                :name="getTaskStatusIcon(task.status)"
                :class="[getTaskStatusColor(task.status), 'w-5 h-5']"
              />
              <div class="flex-1">
                <h4 class="font-medium mb-1">{{ task.name }}</h4>
                <p v-if="task.description" class="text-sm text-muted line-clamp-1">
                  {{ task.description }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <UBadge
                v-if="task.priority"
                :color="getPriorityColor(task.priority)"
                variant="subtle"
              >
                {{ task.priority }}
              </UBadge>
              <UBadge
                :color="getStatusColorBadge(task.status)"
                variant="subtle"
              >
                {{ task.status }}
              </UBadge>
              <div v-if="task.dueDate" class="text-sm text-muted">
                {{ formatDueDate(task.dueDate) }}
              </div>
            </div>
          </div>
        </UCard>

        <div v-if="filteredTasks.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-xl font-semibold mb-2">No tasks found</h3>
          <p class="text-muted">
            {{ searchQuery ? 'Try adjusting your search' : 'Create your first task to get started' }}
          </p>
        </div>
      </div>

      <!-- Create Task Modal -->
      <UModal v-model="showCreateModal">
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">Create New Task</h3>
          </template>

          <form @submit.prevent="handleCreateTask" class="space-y-4">
            <UFormGroup label="Task Name" required>
              <UInput
                v-model="newTask.name"
                placeholder="Enter task name"
                required
              />
            </UFormGroup>

            <UFormGroup label="Description">
              <UTextarea
                v-model="newTask.description"
                placeholder="Enter task description"
                rows="3"
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Status">
                <USelectMenu
                  v-model="newTask.status"
                  :options="['todo', 'in_progress', 'review', 'done']"
                />
              </UFormGroup>

              <UFormGroup label="Priority">
                <USelectMenu
                  v-model="newTask.priority"
                  :options="['low', 'medium', 'high', 'urgent']"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Due Date">
              <UInput
                v-model="newTask.dueDate"
                type="date"
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
                Create Task
              </UButton>
            </div>
          </form>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '#imports'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { tasks, tasksByStatus, loading, error, fetchTasks, createTask, updateTaskStatus } = useTasks()
const toast = useToast()
const route = useRoute()

// State
const view = ref<'board' | 'list'>('board')
const showCreateModal = ref(false)
const creating = ref(false)
const priorityFilter = ref<string>('')
const searchQuery = ref('')

const newTask = ref({
  name: '',
  description: '',
  status: 'todo' as const,
  priority: 'medium' as const,
  dueDate: '',
})

// Options
const priorityOptions = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

// Computed
const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (priorityFilter.value) {
    filtered = filtered.filter(t => t.priority === priorityFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'gray'
  }
}

const getStatusColorBadge = (status?: string) => {
  switch (status) {
    case 'done': return 'green'
    case 'in_progress': return 'blue'
    case 'review': return 'yellow'
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

const formatDueDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const diffTime = d.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `${diffDays} days`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const handleCreateTask = async () => {
  creating.value = true
  try {
    await createTask(newTask.value)

    toast.add({
      title: 'Task created',
      description: 'Your task has been created successfully',
      color: 'green',
    })

    showCreateModal.value = false
    newTask.value = {
      name: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    }
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to create task',
      color: 'red',
    })
  } finally {
    creating.value = false
  }
}

// Handle task drop from KanbanColumn
const handleTaskDrop = async (task: Task, fromStatus: string, toStatus: string) => {
  if (fromStatus === toStatus) return // Same column, no action needed

  try {
    // Update task status
    await updateTaskStatus(task.id, toStatus as any)

    toast.add({
      title: 'Task updated',
      description: `Task moved to ${toStatus.replace('_', ' ')}`,
      color: 'green',
      timeout: 2000,
    })
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to update task',
      color: 'red',
    })
  }
}

// Load tasks on mount
onMounted(async () => {
  const projectId = route.query.project
  await fetchTasks(projectId ? { projectId: Number(projectId) } : undefined)
})
</script>
