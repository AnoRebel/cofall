import { ref, reactive, onMounted, onUnmounted } from 'vue'

export interface DragState {
  isDragging: boolean
  draggedItem: any | null
  draggedFrom: string | null
  currentDropZone: string | null
  dragPreview: { x: number; y: number } | null
}

export interface DropZoneConfig {
  id: string
  accepts: string[]
  onDrop: (item: any, fromZone: string | null) => void
}

// Global drag state for cross-component communication
const globalDragState = reactive<DragState>({
  isDragging: false,
  draggedItem: null,
  draggedFrom: null,
  currentDropZone: null,
  dragPreview: null,
})

export const useDragAndDrop = () => {
  const draggedElement = ref<HTMLElement | null>(null)
  const ghostElement = ref<HTMLElement | null>(null)
  const mousePosition = ref({ x: 0, y: 0 })

  // Add drag styles dynamically
  const addDragStyles = () => {
    if (typeof document === 'undefined') return

    const styleId = 'kanban-drag-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      /* Dragging state */
      .dragging-active {
        user-select: none;
        cursor: grabbing !important;
      }

      .task-card-dragging {
        opacity: 0.5;
        transform: scale(0.95) rotate(2deg);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      }

      .task-card-drag-over {
        transform: translateY(4px);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Drop zone animations */
      .drop-zone {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }

      .drop-zone-active {
        background-color: rgba(59, 130, 246, 0.05);
        border-color: rgba(59, 130, 246, 0.3) !important;
        transform: scale(1.01);
        box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.2);
      }

      .drop-zone-valid {
        background-color: rgba(34, 197, 94, 0.05);
        border-color: rgba(34, 197, 94, 0.4) !important;
      }

      .drop-zone-invalid {
        background-color: rgba(239, 68, 68, 0.05);
        border-color: rgba(239, 68, 68, 0.4) !important;
      }

      /* Task card animations */
      .task-card {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity;
      }

      .task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .task-card-enter-active,
      .task-card-leave-active {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .task-card-enter-from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }

      .task-card-leave-to {
        opacity: 0;
        transform: scale(0.9) translateY(10px);
      }

      /* Drag preview (ghost) */
      .drag-ghost {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transform: rotate(3deg);
        opacity: 0.9;
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
      }

      /* Smooth list transitions */
      .task-list-move {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Pulse animation for drop indicator */
      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        50% {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      }

      .drop-indicator {
        animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      /* Ripple effect on drop */
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }

      .drop-ripple {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
        animation: ripple 0.6s cubic-bezier(0, 0, 0.2, 1);
        pointer-events: none;
      }
    `
    document.head.appendChild(style)
  }

  // Track mouse position for ghost element
  const updateMousePosition = (e: MouseEvent) => {
    mousePosition.value = { x: e.clientX, y: e.clientY }
  }

  // Create draggable item
  const useDraggable = <T = any>(
    item: T,
    type: string,
    sourceZone: string,
    options: {
      onDragStart?: (item: T) => void
      onDragEnd?: (item: T) => void
      disabled?: boolean
    } = {}
  ) => {
    const elementRef = ref<HTMLElement | null>(null)
    const isDragging = ref(false)

    const handleDragStart = (e: DragEvent) => {
      if (options.disabled) {
        e.preventDefault()
        return
      }

      if (!e.dataTransfer) return

      isDragging.value = true
      globalDragState.isDragging = true
      globalDragState.draggedItem = item
      globalDragState.draggedFrom = sourceZone
      draggedElement.value = e.target as HTMLElement

      // Set drag data
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('application/json', JSON.stringify({
        item,
        type,
        sourceZone,
      }))

      // Add dragging class
      if (typeof document !== 'undefined') {
        document.body.classList.add('dragging-active')
        ;(e.target as HTMLElement).classList.add('task-card-dragging')
      }

      options.onDragStart?.(item)
    }

    const handleDragEnd = (e: DragEvent) => {
      isDragging.value = false
      globalDragState.isDragging = false
      globalDragState.draggedItem = null
      globalDragState.draggedFrom = null
      globalDragState.currentDropZone = null
      draggedElement.value = null

      // Remove dragging classes
      if (typeof document !== 'undefined') {
        document.body.classList.remove('dragging-active')
        ;(e.target as HTMLElement).classList.remove('task-card-dragging')
      }

      options.onDragEnd?.(item)
    }

    return {
      elementRef,
      isDragging,
      handleDragStart,
      handleDragEnd,
    }
  }

  // Create droppable zone
  const useDroppable = <T = any>(config: DropZoneConfig) => {
    const elementRef = ref<HTMLElement | null>(null)
    const isOver = ref(false)
    const isValid = ref(false)

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (!e.dataTransfer) return

      // Check if we accept this type
      try {
        const data = e.dataTransfer.getData('application/json')
        if (!data) {
          e.dataTransfer.dropEffect = 'none'
          return
        }

        const { type } = JSON.parse(data)
        const canDrop = config.accepts.includes(type)

        isValid.value = canDrop
        e.dataTransfer.dropEffect = canDrop ? 'move' : 'none'

        globalDragState.currentDropZone = config.id
      } catch (err) {
        e.dataTransfer.dropEffect = 'none'
      }
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      isOver.value = true

      if (elementRef.value) {
        elementRef.value.classList.add('drop-zone-active')
        if (isValid.value) {
          elementRef.value.classList.add('drop-zone-valid')
        }
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      // Only handle if we're leaving the actual drop zone element
      const target = e.currentTarget as HTMLElement
      const relatedTarget = e.relatedTarget as HTMLElement

      if (!target.contains(relatedTarget)) {
        isOver.value = false

        if (elementRef.value) {
          elementRef.value.classList.remove('drop-zone-active', 'drop-zone-valid', 'drop-zone-invalid')
        }
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!e.dataTransfer) return

      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'))
        const { item, type, sourceZone } = data

        if (config.accepts.includes(type)) {
          // Add ripple effect
          if (elementRef.value) {
            const ripple = document.createElement('div')
            ripple.className = 'drop-ripple'
            elementRef.value.appendChild(ripple)
            setTimeout(() => ripple.remove(), 600)
          }

          config.onDrop(item, sourceZone)
        }
      } catch (err) {
        console.error('Failed to handle drop:', err)
      } finally {
        isOver.value = false
        if (elementRef.value) {
          elementRef.value.classList.remove('drop-zone-active', 'drop-zone-valid', 'drop-zone-invalid')
        }
      }
    }

    return {
      elementRef,
      isOver,
      isValid,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
    }
  }

  // Initialize drag and drop system
  onMounted(() => {
    if (typeof window !== 'undefined') {
      addDragStyles()
      document.addEventListener('mousemove', updateMousePosition)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('mousemove', updateMousePosition)
      document.body.classList.remove('dragging-active')
    }
  })

  return {
    globalDragState,
    useDraggable,
    useDroppable,
    mousePosition,
  }
}
