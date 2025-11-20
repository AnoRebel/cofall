<template>
  <div class="min-h-screen p-6">
    <div class="max-w-5xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading">
        <SkeletonCard class="mb-6" />
        <SkeletonCard />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        :title="error"
      />

      <!-- Task Details -->
      <div v-else-if="currentTask" class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                @click="navigateTo('/tasks')"
              />
              <h1 class="text-3xl font-bold">{{ currentTask.name }}</h1>
            </div>
          </div>

          <UDropdown :items="taskActions">
            <UButton
              icon="i-heroicons-ellipsis-horizontal"
              color="gray"
              variant="ghost"
            />
          </UDropdown>
        </div>

        <!-- Status and Priority -->
        <div class="flex items-center gap-3">
          <USelectMenu
            v-model="currentTask.status"
            :options="statusOptions"
            @update:model-value="handleStatusUpdate"
          >
            <UBadge
              :color="getStatusColor(currentTask.status)"
              size="lg"
              class="cursor-pointer"
            >
              {{ currentTask.status }}
            </UBadge>
          </USelectMenu>

          <USelectMenu
            v-model="currentTask.priority"
            :options="priorityOptions"
            @update:model-value="handlePriorityUpdate"
          >
            <UBadge
              :color="getPriorityColor(currentTask.priority)"
              variant="subtle"
              size="lg"
              class="cursor-pointer"
            >
              {{ currentTask.priority }}
            </UBadge>
          </USelectMenu>
        </div>

        <!-- Description -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Description</h2>
          </template>
          <p v-if="currentTask.description" class="text-muted whitespace-pre-wrap">
            {{ currentTask.description }}
          </p>
          <p v-else class="text-muted italic">No description provided</p>
        </UCard>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Due Date -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">Due Date</h3>
                <UButton
                  icon="i-heroicons-pencil"
                  size="xs"
                  variant="ghost"
                  @click="showDueDateModal = true"
                />
              </div>
            </template>
            <div v-if="currentTask.dueDate" class="flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="text-primary" />
              <span>{{ formatDate(currentTask.dueDate) }}</span>
              <UBadge
                v-if="isOverdue(currentTask.dueDate)"
                color="red"
                variant="subtle"
              >
                Overdue
              </UBadge>
            </div>
            <p v-else class="text-muted italic">No due date set</p>
          </UCard>

          <!-- Assigned Users -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">Assigned To</h3>
                <UButton
                  icon="i-heroicons-plus"
                  size="xs"
                  variant="ghost"
                  @click="showAssignModal = true"
                />
              </div>
            </template>
            <div v-if="currentTask.assignedTo?.length" class="flex flex-wrap gap-2">
              <UBadge
                v-for="userId in currentTask.assignedTo"
                :key="userId"
                variant="subtle"
              >
                {{ userId }}
              </UBadge>
            </div>
            <p v-else class="text-muted italic">No one assigned</p>
          </UCard>
        </div>

        <!-- Related Projects -->
        <UCard v-if="currentTask.projects?.length">
          <template #header>
            <h3 class="font-semibold">Projects</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="project in currentTask.projects"
              :key="project.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              @click="navigateTo(`/projects/${project.id}`)"
            >
              <span class="font-medium">{{ project.name }}</span>
              <UIcon name="i-heroicons-arrow-right" />
            </div>
          </div>
        </UCard>

        <!-- Related Issues -->
        <UCard v-if="currentTask.issues?.length">
          <template #header>
            <h3 class="font-semibold">Issues</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="issue in currentTask.issues"
              :key="issue.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              @click="navigateTo(`/issues/${issue.id}`)"
            >
              <div>
                <p class="font-medium">{{ issue.title }}</p>
                <p class="text-sm text-muted">{{ issue.description }}</p>
              </div>
              <UBadge
                :color="getIssueStatusColor(issue.status)"
                variant="subtle"
              >
                {{ issue.status }}
              </UBadge>
            </div>
          </div>
        </UCard>

        <!-- Timestamps -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Activity</h3>
          </template>
          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-muted">Created</dt>
              <dd class="font-medium">{{ formatDate(currentTask.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted">Last Updated</dt>
              <dd class="font-medium">{{ formatDate(currentTask.updatedAt) }}</dd>
            </div>
          </dl>
        </UCard>
      </div>

      <!-- Due Date Modal -->
      <UModal v-model="showDueDateModal">
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">Update Due Date</h3>
          </template>
          <form @submit.prevent="handleUpdateDueDate" class="space-y-4">
            <UFormGroup label="Due Date">
              <UInput
                v-model="dueDateForm"
                type="date"
              />
            </UFormGroup>
            <div class="flex justify-end gap-3">
              <UButton
                color="gray"
                variant="ghost"
                @click="showDueDateModal = false"
              >
                Cancel
              </UButton>
              <UButton type="submit">
                Update
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
const { currentTask, loading, error, fetchTask, updateTask, updateTaskStatus, updateTaskPriority, updateDueDate, deleteTask } = useTasks()

// State
const showDueDateModal = ref(false)
const showAssignModal = ref(false)
const dueDateForm = ref('')

// Options
const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

// Actions
const taskActions = computed(() => [[
  {
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: async () => {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          await deleteTask(Number(route.params.id))
          toast.add({
            title: 'Task deleted',
            color: 'green',
          })
          navigateTo('/tasks')
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
    case 'done': return 'green'
    case 'in_progress': return 'blue'
    case 'review': return 'yellow'
    default: return 'gray'
  }
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'gray'
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isOverdue = (date: string) => {
  return new Date(date) < new Date()
}

const handleStatusUpdate = async (newStatus: string) => {
  try {
    await updateTaskStatus(Number(route.params.id), newStatus as any)
    toast.add({
      title: 'Status updated',
      color: 'green',
    })
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'red',
    })
  }
}

const handlePriorityUpdate = async (newPriority: string) => {
  try {
    await updateTaskPriority(Number(route.params.id), newPriority as any)
    toast.add({
      title: 'Priority updated',
      color: 'green',
    })
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'red',
    })
  }
}

const handleUpdateDueDate = async () => {
  try {
    await updateDueDate(Number(route.params.id), dueDateForm.value)
    toast.add({
      title: 'Due date updated',
      color: 'green',
    })
    showDueDateModal.value = false
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message,
      color: 'red',
    })
  }
}

// Load task on mount
onMounted(() => {
  fetchTask(Number(route.params.id))
  if (currentTask.value?.dueDate) {
    dueDateForm.value = currentTask.value.dueDate
  }
})
</script>
