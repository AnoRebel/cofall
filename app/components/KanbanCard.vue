<script setup lang="ts">
import type { Task } from '#imports'
import { useDraggable } from '~/composables/useDragAndDrop'

const props = defineProps<{
  task: Task
  statusKey: string
}>()

const emit = defineEmits<{
  click: []
}>()

// Set up draggable
const { elementRef, isDragging } = useDraggable({
  id: `task-${props.statusKey}-${props.task.id}`,
  data: props.task,
})

// Helper functions
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'gray'
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

const isOverdue = (date: string) => {
  return new Date(date) < new Date()
}
</script>

<template>
  <div
    ref="elementRef"
    class="task-card"
    :class="{ 'opacity-50': isDragging }"
  >
    <UCard
      class="hover:shadow-lg transition-shadow"
      @click.stop="emit('click')"
    >
      <div class="space-y-2">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <UIcon
              name="i-heroicons-bars-3"
              class="text-muted flex-shrink-0 cursor-grab"
            />
            <h4 class="font-medium truncate">{{ task.name }}</h4>
          </div>
          <UBadge
            v-if="task.priority"
            :color="getPriorityColor(task.priority)"
            variant="subtle"
            size="sm"
            class="flex-shrink-0"
          >
            {{ task.priority }}
          </UBadge>
        </div>

        <!-- Description -->
        <p
          v-if="task.description"
          class="text-sm text-muted line-clamp-2"
        >
          {{ task.description }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-muted">
          <div
            v-if="task.assignedTo?.length"
            class="flex items-center gap-1"
          >
            <UIcon name="i-heroicons-user" class="w-3 h-3" />
            <span>{{ task.assignedTo.length }}</span>
          </div>
          <div
            v-if="task.dueDate"
            class="flex items-center gap-1"
            :class="{ 'text-red-500': isOverdue(task.dueDate) }"
          >
            <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
            <span>{{ formatDueDate(task.dueDate) }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
