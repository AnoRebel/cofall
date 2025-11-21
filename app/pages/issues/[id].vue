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

      <!-- Issue Details -->
      <div v-else-if="currentIssue" class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                @click="navigateTo('/issues')"
              />
              <UIcon
                :name="getIssueIcon(currentIssue.priority)"
                :class="[getPriorityIconColor(currentIssue.priority), 'w-6 h-6']"
              />
              <h1 class="text-3xl font-bold">{{ currentIssue.title }}</h1>
            </div>
            <p class="text-muted ml-14">Reported by {{ currentIssue.user }}</p>
          </div>

          <UDropdown :items="issueActions">
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
            v-model="currentIssue.status"
            :options="statusOptions"
            @update:model-value="handleStatusUpdate"
          >
            <UBadge
              :color="getStatusColor(currentIssue.status)"
              size="lg"
              class="cursor-pointer"
            >
              {{ currentIssue.status }}
            </UBadge>
          </USelectMenu>

          <USelectMenu
            v-model="currentIssue.priority"
            :options="priorityOptions"
            @update:model-value="handlePriorityUpdate"
          >
            <UBadge
              :color="getPriorityColor(currentIssue.priority)"
              :variant="currentIssue.priority === 'critical' ? 'solid' : 'subtle'"
              size="lg"
              class="cursor-pointer"
            >
              {{ currentIssue.priority }}
            </UBadge>
          </USelectMenu>

          <UBadge variant="outline">
            {{ currentIssue.parent }}
          </UBadge>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-3">
          <UButton
            v-if="currentIssue.status !== 'resolved'"
            @click="handleResolve"
            color="green"
            variant="soft"
          >
            Mark as Resolved
          </UButton>
          <UButton
            v-if="currentIssue.status === 'resolved'"
            @click="handleReopen"
            color="blue"
            variant="soft"
          >
            Reopen Issue
          </UButton>
          <UButton
            v-if="currentIssue.status !== 'closed'"
            @click="handleClose"
            color="gray"
            variant="soft"
          >
            Close Issue
          </UButton>
        </div>

        <!-- Description -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Description</h2>
          </template>
          <p class="text-muted whitespace-pre-wrap">{{ currentIssue.description }}</p>
        </UCard>

        <!-- Related Projects -->
        <UCard v-if="currentIssue.projects?.length">
          <template #header>
            <h3 class="font-semibold">Related Projects</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="project in currentIssue.projects"
              :key="project.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              @click="navigateTo(`/projects/${project.id}`)"
            >
              <div>
                <p class="font-medium">{{ project.name }}</p>
                <p v-if="project.description" class="text-sm text-muted">
                  {{ project.description }}
                </p>
              </div>
              <UIcon name="i-heroicons-arrow-right" />
            </div>
          </div>
        </UCard>

        <!-- Related Tasks -->
        <UCard v-if="currentIssue.tasks?.length">
          <template #header>
            <h3 class="font-semibold">Related Tasks</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="task in currentIssue.tasks"
              :key="task.id"
              class="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              @click="navigateTo(`/tasks/${task.id}`)"
            >
              <div>
                <p class="font-medium">{{ task.name }}</p>
                <p v-if="task.description" class="text-sm text-muted">
                  {{ task.description }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <UBadge
                  :color="getTaskStatusColor(task.status)"
                  variant="subtle"
                >
                  {{ task.status }}
                </UBadge>
                <UIcon name="i-heroicons-arrow-right" />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Activity Timeline -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Activity</h3>
          </template>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div class="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <p class="font-medium">Issue created</p>
                <p class="text-sm text-muted">{{ formatDate(currentIssue.createdAt) }}</p>
              </div>
            </div>
            <div v-if="currentIssue.updatedAt !== currentIssue.createdAt" class="flex gap-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p class="font-medium">Last updated</p>
                <p class="text-sm text-muted">{{ formatDate(currentIssue.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Metadata -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">Information</h3>
          </template>
          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-muted">Reporter</dt>
              <dd class="font-medium">{{ currentIssue.user }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted">Parent Type</dt>
              <dd class="font-medium capitalize">{{ currentIssue.parent }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted">Created</dt>
              <dd class="font-medium">{{ formatDate(currentIssue.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted">Last Updated</dt>
              <dd class="font-medium">{{ formatDate(currentIssue.updatedAt) }}</dd>
            </div>
          </dl>
        </UCard>
      </div>
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
const { currentIssue, loading, error, fetchIssue, updateIssue, updateIssueStatus, updateIssuePriority, resolveIssue, closeIssue, reopenIssue, deleteIssue } = useIssues()

// Options
const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

// Actions
const issueActions = computed(() => [[
  {
    label: 'Delete',
    icon: 'i-heroicons-trash',
    click: async () => {
      if (confirm('Are you sure you want to delete this issue?')) {
        try {
          await deleteIssue(Number(route.params.id))
          toast.add({
            title: 'Issue deleted',
            color: 'green',
          })
          navigateTo('/issues')
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
    case 'open': return 'red'
    case 'in_progress': return 'yellow'
    case 'resolved': return 'green'
    case 'closed': return 'gray'
    default: return 'gray'
  }
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'critical': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'gray'
  }
}

const getTaskStatusColor = (status?: string) => {
  switch (status) {
    case 'done': return 'green'
    case 'in_progress': return 'blue'
    case 'review': return 'yellow'
    default: return 'gray'
  }
}

const getIssueIcon = (priority?: string) => {
  switch (priority) {
    case 'critical': return 'i-heroicons-fire'
    case 'high': return 'i-heroicons-exclamation-triangle'
    default: return 'i-heroicons-information-circle'
  }
}

const getPriorityIconColor = (priority?: string) => {
  switch (priority) {
    case 'critical': return 'text-red-500'
    case 'high': return 'text-orange-500'
    case 'medium': return 'text-yellow-500'
    default: return 'text-blue-500'
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

const handleStatusUpdate = async (newStatus: string) => {
  try {
    await updateIssueStatus(Number(route.params.id), newStatus as any)
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
    await updateIssuePriority(Number(route.params.id), newPriority as any)
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

const handleResolve = async () => {
  try {
    await resolveIssue(Number(route.params.id))
    toast.add({
      title: 'Issue resolved',
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

const handleClose = async () => {
  try {
    await closeIssue(Number(route.params.id))
    toast.add({
      title: 'Issue closed',
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

const handleReopen = async () => {
  try {
    await reopenIssue(Number(route.params.id))
    toast.add({
      title: 'Issue reopened',
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

// Load issue on mount
onMounted(() => {
  fetchIssue(Number(route.params.id))
})
</script>
