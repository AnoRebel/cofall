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
        <div
          v-for="(statusTasks, statusKey) in tasksByStatus"
          :key="statusKey"
          class="space-y-3"
        >
          <div class="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
            <h3 class="font-semibold capitalize">{{ statusKey.replace('_', ' ') }}</h3>
            <UBadge variant="subtle">{{ statusTasks.length }}</UBadge>
          </div>

          <!-- Drop Zone -->
          <div
            :ref="(el) => setupDropZone(el as HTMLElement, statusKey)"
            class="drop-zone min-h-[200px] space-y-3 p-2 border-2 border-dashed border-transparent rounded-lg"
            :class="{ 'drop-indicator': isDropZoneActive(statusKey) }"
          >
            <TransitionGroup name="task-card" tag="div" class="space-y-3">
              <!-- Draggable Task Cards -->
              <div
                v-for="task in statusTasks"
                :key="task.id"
                :ref="(el) => setupDraggable(el as HTMLElement, task, statusKey)"
                class="task-card"
                draggable="true"
              >
                <UCard
                  class="cursor-grab active:cursor-grabbing hover:shadow-lg"
                  @click.stop="navigateTo(`/tasks/${task.id}`)"
                >
                  <div class="space-y-2">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-bars-3" class="text-muted cursor-grab" />
                        <h4 class="font-medium">{{ task.name }}</h4>
                      </div>
                      <UBadge
                        v-if="task.priority"
                        :color="getPriorityColor(task.priority)"
                        variant="subtle"
                        size="sm"
                      >
                        {{ task.priority }}
                      </UBadge>
                    </div>

                    <p v-if="task.description" class="text-sm text-muted line-clamp-2">
                      {{ task.description }}
                    </p>

                    <div class="flex items-center justify-between text-xs text-muted">
                      <div v-if="task.assignedTo?.length" class="flex items-center gap-1">
                        <UIcon name="i-heroicons-user" />
                        <span>{{ task.assignedTo.length }}</span>
                      </div>
                      <div v-if="task.dueDate" class="flex items-center gap-1">
                        <UIcon name="i-heroicons-calendar" />
                        <span>{{ formatDueDate(task.dueDate) }}</span>
                      </div>
                    </div>
                  </div>
                </UCard>
              </div>
            </TransitionGroup>

            <div v-if="statusTasks.length === 0" class="text-center py-8 text-muted text-sm">
              Drop tasks here
            </div>
          </div>
        </div>
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
const { useDraggable, useDroppable } = useDragAndDrop()
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

// Drag and Drop Setup
const dropZones = new Map<string, any>()
const draggables = new Map<string, any>()

const setupDropZone = (el: HTMLElement | null, statusKey: string) => {
  if (!el || dropZones.has(statusKey)) return

  const dropZone = useDroppable({
    id: statusKey,
    accepts: ['task'],
    onDrop: async (task: Task, fromZone: string | null) => {
      if (fromZone === statusKey) return // Same column, no action needed

      try {
        // Update task status
        await updateTaskStatus(task.id, statusKey as any)

        toast.add({
          title: 'Task updated',
          description: `Task moved to ${statusKey.replace('_', ' ')}`,
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
    },
  })

  dropZone.elementRef.value = el
  el.addEventListener('dragover', dropZone.handleDragOver)
  el.addEventListener('dragenter', dropZone.handleDragEnter)
  el.addEventListener('dragleave', dropZone.handleDragLeave)
  el.addEventListener('drop', dropZone.handleDrop)

  dropZones.set(statusKey, dropZone)
}

const setupDraggable = (el: HTMLElement | null, task: Task, statusKey: string) => {
  if (!el) return

  const draggableKey = `${task.id}-${statusKey}`
  if (draggables.has(draggableKey)) return

  const draggable = useDraggable(task, 'task', statusKey, {
    onDragStart: (task: Task) => {
      // Optional: Add visual feedback
    },
    onDragEnd: (task: Task) => {
      // Optional: Cleanup
    },
  })

  draggable.elementRef.value = el
  el.addEventListener('dragstart', draggable.handleDragStart)
  el.addEventListener('dragend', draggable.handleDragEnd)

  draggables.set(draggableKey, draggable)
}

const isDropZoneActive = (statusKey: string) => {
  const dropZone = dropZones.get(statusKey)
  return dropZone?.isOver?.value || false
}

// Load tasks on mount
onMounted(async () => {
  const projectId = route.query.project
  await fetchTasks(projectId ? { projectId: Number(projectId) } : undefined)
})
</script>
