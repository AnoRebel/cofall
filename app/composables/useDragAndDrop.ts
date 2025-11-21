/**
 * Enhanced Drag and Drop Composable
 * Implements a vue-dnd-kit compatible API with native pointer events
 * for better touch/mobile support
 */
import { ref, reactive, computed, onMounted, onUnmounted, type Ref } from 'vue'

// Types
export interface DragState {
  isDragging: boolean
  draggedItem: any | null
  draggedFrom: string | null
  currentDropZone: string | null
  dragPosition: { x: number; y: number }
}

export interface UseDraggableOptions<T = any> {
  id: string
  data?: T
  disabled?: boolean
}

export interface UseDroppableOptions {
  id: string
  disabled?: boolean
  onDrop?: (data: any, sourceId: string | null) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
}

// Global drag state - reactive across all components
const globalDragState = reactive<DragState>({
  isDragging: false,
  draggedItem: null,
  draggedFrom: null,
  currentDropZone: null,
  dragPosition: { x: 0, y: 0 },
})

// Track active drop zones
const dropZones = new Map<string, UseDroppableOptions>()

// CSS styles for drag and drop
const dragStyles = `
/* Dragging state */
.dnd-dragging {
  user-select: none;
  touch-action: none;
}

.dnd-draggable {
  cursor: grab;
  touch-action: none;
}

.dnd-draggable:active {
  cursor: grabbing;
}

.dnd-draggable-dragging {
  opacity: 0.4;
  transform: scale(0.98);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Drop zone styles */
.dnd-droppable {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dnd-droppable-over {
  background-color: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.4) !important;
  transform: scale(1.005);
}

.dnd-droppable-active {
  border-color: rgba(34, 197, 94, 0.3) !important;
}

/* Ghost element (drag preview) */
.dnd-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transform: rotate(2deg) scale(1.02);
  opacity: 0.95;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease, opacity 0.1s ease;
}

/* List animations */
.dnd-list-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dnd-list-enter-active,
.dnd-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dnd-list-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-8px);
}

.dnd-list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(8px);
}

/* Drop ripple effect */
@keyframes dnd-ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

.dnd-ripple {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%);
  animation: dnd-ripple 0.5s cubic-bezier(0, 0, 0.2, 1);
  pointer-events: none;
}

/* Touch feedback */
@media (hover: none) {
  .dnd-draggable:active {
    transform: scale(0.97);
    transition: transform 0.1s ease;
  }
}
`

// Inject styles once
let stylesInjected = false
const injectStyles = () => {
  if (stylesInjected || typeof document === 'undefined') return
  const styleEl = document.createElement('style')
  styleEl.id = 'vue-dnd-kit-styles'
  styleEl.textContent = dragStyles
  document.head.appendChild(styleEl)
  stylesInjected = true
}

/**
 * Draggable composable - makes an element draggable
 */
export const useDraggable = <T = any>(options: UseDraggableOptions<T>) => {
  const elementRef = ref<HTMLElement | null>(null)
  const isDragging = ref(false)
  const initialPosition = ref({ x: 0, y: 0 })

  let ghostEl: HTMLElement | null = null

  const createGhost = (sourceEl: HTMLElement, x: number, y: number) => {
    ghostEl = sourceEl.cloneNode(true) as HTMLElement
    ghostEl.className = `${sourceEl.className} dnd-ghost`
    ghostEl.style.width = `${sourceEl.offsetWidth}px`
    ghostEl.style.left = `${x - sourceEl.offsetWidth / 2}px`
    ghostEl.style.top = `${y - sourceEl.offsetHeight / 2}px`
    document.body.appendChild(ghostEl)
  }

  const moveGhost = (x: number, y: number) => {
    if (!ghostEl || !elementRef.value) return
    ghostEl.style.left = `${x - elementRef.value.offsetWidth / 2}px`
    ghostEl.style.top = `${y - elementRef.value.offsetHeight / 2}px`
  }

  const removeGhost = () => {
    if (ghostEl) {
      ghostEl.remove()
      ghostEl = null
    }
  }

  const handlePointerDown = (e: PointerEvent) => {
    if (options.disabled || !elementRef.value) return

    // Ignore if not primary button (left click or touch)
    if (e.button !== 0) return

    e.preventDefault()
    initialPosition.value = { x: e.clientX, y: e.clientY }

    // Start drag after small movement threshold (prevents accidental drags)
    const startDrag = (moveE: PointerEvent) => {
      const dx = moveE.clientX - initialPosition.value.x
      const dy = moveE.clientY - initialPosition.value.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 5) {
        document.removeEventListener('pointermove', startDrag)
        inititateDrag(moveE)
      }
    }

    const cancelDrag = () => {
      document.removeEventListener('pointermove', startDrag)
      document.removeEventListener('pointerup', cancelDrag)
    }

    document.addEventListener('pointermove', startDrag)
    document.addEventListener('pointerup', cancelDrag)
  }

  const inititateDrag = (e: PointerEvent) => {
    if (!elementRef.value) return

    isDragging.value = true
    globalDragState.isDragging = true
    globalDragState.draggedItem = options.data
    globalDragState.draggedFrom = options.id
    globalDragState.dragPosition = { x: e.clientX, y: e.clientY }

    // Add classes
    document.body.classList.add('dnd-dragging')
    elementRef.value.classList.add('dnd-draggable-dragging')

    // Create ghost
    createGhost(elementRef.value, e.clientX, e.clientY)

    // Capture pointer for reliable tracking
    elementRef.value.setPointerCapture(e.pointerId)

    // Listen for move and end
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.value) return

    globalDragState.dragPosition = { x: e.clientX, y: e.clientY }
    moveGhost(e.clientX, e.clientY)

    // Find drop zone under cursor
    const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY)
    let foundDropZone: string | null = null

    for (const el of elementsUnder) {
      const dropId = (el as HTMLElement).dataset?.droppableId
      if (dropId && dropZones.has(dropId)) {
        foundDropZone = dropId
        break
      }
    }

    // Update current drop zone
    if (foundDropZone !== globalDragState.currentDropZone) {
      // Leave previous
      if (globalDragState.currentDropZone) {
        const prevZone = dropZones.get(globalDragState.currentDropZone)
        prevZone?.onDragLeave?.()
      }

      // Enter new
      globalDragState.currentDropZone = foundDropZone
      if (foundDropZone) {
        const newZone = dropZones.get(foundDropZone)
        newZone?.onDragEnter?.()
      }
    }
  }

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging.value) return

    // Handle drop
    if (globalDragState.currentDropZone) {
      const dropZone = dropZones.get(globalDragState.currentDropZone)
      if (dropZone) {
        dropZone.onDrop?.(globalDragState.draggedItem, globalDragState.draggedFrom)
      }
    }

    // Cleanup
    isDragging.value = false
    globalDragState.isDragging = false
    globalDragState.draggedItem = null
    globalDragState.draggedFrom = null
    globalDragState.currentDropZone = null

    document.body.classList.remove('dnd-dragging')
    elementRef.value?.classList.remove('dnd-draggable-dragging')
    removeGhost()

    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
  }

  onMounted(() => {
    injectStyles()
    if (elementRef.value) {
      elementRef.value.classList.add('dnd-draggable')
      elementRef.value.addEventListener('pointerdown', handlePointerDown)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('pointerdown', handlePointerDown)
    }
    removeGhost()
  })

  return {
    elementRef,
    isDragging: computed(() => isDragging.value),
    attributes: {
      'data-draggable-id': options.id,
    },
  }
}

/**
 * Droppable composable - creates a drop zone
 */
export const useDroppable = (options: UseDroppableOptions) => {
  const elementRef = ref<HTMLElement | null>(null)
  const isOver = ref(false)

  // Register drop zone
  onMounted(() => {
    injectStyles()
    dropZones.set(options.id, {
      ...options,
      onDragEnter: () => {
        isOver.value = true
        elementRef.value?.classList.add('dnd-droppable-over')
        options.onDragEnter?.()
      },
      onDragLeave: () => {
        isOver.value = false
        elementRef.value?.classList.remove('dnd-droppable-over')
        options.onDragLeave?.()
      },
      onDrop: (data, sourceId) => {
        isOver.value = false
        elementRef.value?.classList.remove('dnd-droppable-over')

        // Add ripple effect
        if (elementRef.value) {
          const ripple = document.createElement('div')
          ripple.className = 'dnd-ripple'
          elementRef.value.appendChild(ripple)
          setTimeout(() => ripple.remove(), 500)
        }

        options.onDrop?.(data, sourceId)
      },
    })

    if (elementRef.value) {
      elementRef.value.classList.add('dnd-droppable')
      elementRef.value.dataset.droppableId = options.id
    }
  })

  onUnmounted(() => {
    dropZones.delete(options.id)
  })

  return {
    elementRef,
    isOver: computed(() => isOver.value),
    isActive: computed(() => globalDragState.isDragging),
    attributes: {
      'data-droppable-id': options.id,
    },
  }
}

/**
 * Main composable export
 */
export const useDragAndDrop = () => {
  return {
    globalDragState,
    useDraggable,
    useDroppable,
  }
}

export default useDragAndDrop
