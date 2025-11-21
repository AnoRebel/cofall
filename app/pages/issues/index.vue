<template>
  <div class="min-h-screen p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold">Issues</h1>
          <p class="text-muted mt-1">Track bugs, feedback, and improvements</p>
        </div>
        <UButton
          icon="i-heroicons-plus"
          size="lg"
          @click="showCreateModal = true"
        >
          New Issue
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
        <USelectMenu
          v-model="priorityFilter"
          :options="priorityOptions"
          placeholder="Filter by priority"
          class="w-48"
        />
        <USelectMenu
          v-model="parentFilter"
          :options="parentOptions"
          placeholder="Filter by parent"
          class="w-48"
        />
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search issues..."
          class="flex-1"
        />
      </div>

      <!-- Critical Issues Banner -->
      <UAlert
        v-if="criticalIssues.length > 0"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        :title="`${criticalIssues.length} critical ${criticalIssues.length === 1 ? 'issue' : 'issues'} require immediate attention`"
        class="mb-6"
      />

      <!-- Loading State -->
      <div v-if="loading" class="space-y-3">
        <SkeletonCard v-for="i in 5" :key="i" />
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
        v-else-if="filteredIssues.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">🐛</div>
        <h3 class="text-xl font-semibold mb-2">No issues found</h3>
        <p class="text-muted mb-6">
          {{ searchQuery ? 'Try adjusting your search' : 'Create your first issue to get started' }}
        </p>
        <UButton
          v-if="!searchQuery"
          @click="showCreateModal = true"
        >
          Report Issue
        </UButton>
      </div>

      <!-- Issues List -->
      <div v-else class="space-y-3">
        <UCard
          v-for="issue in filteredIssues"
          :key="issue.id"
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="navigateTo(`/issues/${issue.id}`)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <UIcon
                  :name="getIssueIcon(issue.priority)"
                  :class="[getPriorityIconColor(issue.priority), 'w-5 h-5']"
                />
                <h3 class="font-semibold">{{ issue.title }}</h3>
                <UBadge
                  v-if="issue.priority === 'critical'"
                  color="red"
                  variant="solid"
                >
                  Critical
                </UBadge>
              </div>
              <p class="text-muted text-sm line-clamp-2 ml-8">
                {{ issue.description }}
              </p>
              <div class="flex items-center gap-4 mt-3 ml-8 text-sm text-muted">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-user" />
                  <span>{{ issue.user }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-tag" />
                  <span>{{ issue.parent }}</span>
                </div>
                <div>{{ formatDate(issue.createdAt) }}</div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <UBadge
                :color="getStatusColor(issue.status)"
                variant="subtle"
              >
                {{ issue.status }}
              </UBadge>
              <UBadge
                v-if="issue.priority && issue.priority !== 'critical'"
                :color="getPriorityColor(issue.priority)"
                variant="subtle"
              >
                {{ issue.priority }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Create Issue Modal -->
      <UModal v-model="showCreateModal">
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">Report New Issue</h3>
          </template>

          <form @submit.prevent="handleCreateIssue" class="space-y-4">
            <UFormGroup label="Title" required>
              <UInput
                v-model="newIssue.title"
                placeholder="Enter issue title"
                required
              />
            </UFormGroup>

            <UFormGroup label="Description" required>
              <UTextarea
                v-model="newIssue.description"
                placeholder="Describe the issue in detail"
                rows="4"
                required
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Status">
                <USelectMenu
                  v-model="newIssue.status"
                  :options="['open', 'in_progress', 'resolved', 'closed']"
                />
              </UFormGroup>

              <UFormGroup label="Priority">
                <USelectMenu
                  v-model="newIssue.priority"
                  :options="['low', 'medium', 'high', 'critical']"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Parent Type" required>
              <USelectMenu
                v-model="newIssue.parent"
                :options="['project', 'task']"
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
                Create Issue
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

const { issues, criticalIssues, loading, error, fetchIssues, createIssue } = useIssues()
const toast = useToast()
const route = useRoute()
const { user } = useUserSession()

// State
const showCreateModal = ref(false)
const creating = ref(false)
const statusFilter = ref<string>('')
const priorityFilter = ref<string>('')
const parentFilter = ref<string>('')
const searchQuery = ref('')

const newIssue = ref({
  title: '',
  description: '',
  status: 'open' as const,
  priority: 'medium' as const,
  parent: 'project' as const,
  user: '',
})

// Options
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const priorityOptions = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

const parentOptions = [
  { label: 'All', value: '' },
  { label: 'Project', value: 'project' },
  { label: 'Task', value: 'task' },
]

// Computed
const filteredIssues = computed(() => {
  let filtered = issues.value

  if (statusFilter.value) {
    filtered = filtered.filter(i => i.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(i => i.priority === priorityFilter.value)
  }

  if (parentFilter.value) {
    filtered = filtered.filter(i => i.parent === parentFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      i =>
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.user.toLowerCase().includes(query)
    )
  }

  return filtered
})

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const handleCreateIssue = async () => {
  if (!user.value) return

  creating.value = true
  try {
    newIssue.value.user = user.value.username

    await createIssue(newIssue.value)

    toast.add({
      title: 'Issue created',
      description: 'Your issue has been reported successfully',
      color: 'green',
    })

    showCreateModal.value = false
    newIssue.value = {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      parent: 'project',
      user: '',
    }
  } catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message || 'Failed to create issue',
      color: 'red',
    })
  } finally {
    creating.value = false
  }
}

// Load issues on mount
onMounted(async () => {
  const projectId = route.query.project
  const taskId = route.query.task
  await fetchIssues({
    ...(projectId && { projectId: Number(projectId) }),
    ...(taskId && { taskId: Number(taskId) }),
  })
})
</script>
