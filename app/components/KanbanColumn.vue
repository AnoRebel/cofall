<script setup lang="ts">
import type { Task } from '#imports'
import { useDraggable, useDroppable } from '~/composables/useDragAndDrop'

const props = defineProps<{
  statusKey: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  taskDropped: [task: Task, fromStatus: string, toStatus: string]
  taskClick: [task: Task]
}>()

// Set up drop zone for this column
const { elementRef: dropRef, isOver, isActive } = useDroppable({
  id: `column-${props.statusKey}`,
  onDrop: (task: Task, sourceId: string | null) => {
    if (!sourceId) return
    // Extract status from source column id (e.g., "column-todo" -> "todo")
    const fromStatus = sourceId.replace('column-', '').replace('task-', '').split('-')[0]
    if (fromStatus !== props.statusKey) {
      emit('taskDropped', task, fromStatus, props.statusKey)
    }
  },
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
</script>

<template>
  <div class="space-y-3">
    <!-- Column Header -->
    <div class="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
      <h3 class="font-semibold capitalize">{{ statusKey.replace('_', ' ') }}</h3>
      <UBadge variant="subtle">{{ tasks.length }}</UBadge>
    </div>

    <!-- Drop Zone -->
    <div
      ref="dropRef"
      class="min-h-[200px] space-y-3 p-2 border-2 border-dashed rounded-lg transition-all duration-200"
      :class="[
        isOver ? 'border-primary bg-primary/5' : 'border-transparent',
        isActive ? 'border-muted' : ''
      ]"
    >
      <TransitionGroup name="dnd-list" tag="div" class="space-y-3">
        <!-- Draggable Task Cards -->
        <KanbanCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :status-key="statusKey"
          @click="emit('taskClick', task)"
        />
      </TransitionGroup>

      <!-- Empty State -->
      <div
        v-if="tasks.length === 0"
        class="text-center py-8 text-muted text-sm transition-opacity"
        :class="isOver ? 'opacity-50' : 'opacity-100'"
      >
        {{ isOver ? 'Drop here' : 'No tasks' }}
      </div>
    </div>
  </div>
</template>
