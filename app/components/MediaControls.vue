<script setup lang="ts">
const props = defineProps<{
  roomId: string
  users: string[]
}>()

const emit = defineEmits<{
  (e: 'mediaStateChange', state: any): void
}>()

const { user } = useUserSession()
const toast = useToast()

const {
  localStream,
  remoteStreams,
  mediaState,
  isInitialized,
  error,
  initialize,
  getUserMedia,
  startScreenShare,
  stopScreenShare,
  callPeer,
  toggleAudio,
  toggleVideo,
  cleanup,
} = useWebRTC()

const isJoiningCall = ref(false)
const showVideoPanel = ref(false)
const localVideoRef = ref<HTMLVideoElement | null>(null)

// Initialize WebRTC on mount
onMounted(async () => {
  if (user.value) {
    await initialize(`${props.roomId}-${user.value.id}`)
  }
})

// Join voice/video call
const joinCall = async (withVideo: boolean = false) => {
  isJoiningCall.value = true
  try {
    await getUserMedia(true, withVideo)

    if (localVideoRef.value && localStream.value) {
      localVideoRef.value.srcObject = localStream.value
    }

    // Call all other users in room
    props.users.forEach(username => {
      if (username !== user.value?.username) {
        // In a real app, you'd need to map username to peerId
        // This is simplified for demo
        callPeer(`${props.roomId}-${username}`)
      }
    })

    if (withVideo) {
      showVideoPanel.value = true
    }

    toast.add({
      title: withVideo ? 'Video call started' : 'Voice call started',
      color: 'success',
    })
  } catch (err: any) {
    toast.add({
      title: 'Failed to join call',
      description: err.message,
      color: 'error',
    })
  } finally {
    isJoiningCall.value = false
  }
}

// Leave call
const leaveCall = () => {
  cleanup()
  showVideoPanel.value = false
  toast.add({
    title: 'Left call',
    color: 'info',
  })
}

// Handle screen share
const handleScreenShare = async () => {
  if (mediaState.value.screenSharing) {
    stopScreenShare()
  } else {
    try {
      await startScreenShare()
      showVideoPanel.value = true
    } catch (err: any) {
      toast.add({
        title: 'Screen sharing failed',
        description: err.message,
        color: 'error',
      })
    }
  }
}

// Watch for stream changes
watch(localStream, (stream) => {
  if (localVideoRef.value && stream) {
    localVideoRef.value.srcObject = stream
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div>
    <!-- Media control buttons -->
    <div class="flex items-center gap-1">
      <!-- Voice call -->
      <UTooltip :text="localStream ? 'Leave call' : 'Join voice'">
        <UButton
          variant="ghost"
          size="sm"
          @click="localStream ? leaveCall() : joinCall(false)"
          :loading="isJoiningCall"
          :class="localStream && !mediaState.videoEnabled ? 'bg-success/20 text-success' : ''"
        >
          <UIcon
            :name="localStream ? 'i-heroicons-phone-x-mark' : 'i-heroicons-phone'"
            class="w-4 h-4"
          />
        </UButton>
      </UTooltip>

      <!-- Video call -->
      <UTooltip :text="mediaState.videoEnabled ? 'Disable video' : 'Enable video'">
        <UButton
          variant="ghost"
          size="sm"
          @click="localStream ? toggleVideo() : joinCall(true)"
          :class="mediaState.videoEnabled ? 'bg-success/20 text-success' : ''"
        >
          <UIcon
            :name="mediaState.videoEnabled ? 'i-heroicons-video-camera' : 'i-heroicons-video-camera-slash'"
            class="w-4 h-4"
          />
        </UButton>
      </UTooltip>

      <!-- Mute/unmute -->
      <UTooltip v-if="localStream" :text="mediaState.audioEnabled ? 'Mute' : 'Unmute'">
        <UButton
          variant="ghost"
          size="sm"
          @click="toggleAudio"
          :class="!mediaState.audioEnabled ? 'bg-destructive/20 text-destructive' : ''"
        >
          <UIcon
            :name="mediaState.audioEnabled ? 'i-heroicons-microphone' : 'i-heroicons-microphone-slash'"
            class="w-4 h-4"
          />
        </UButton>
      </UTooltip>

      <!-- Screen share -->
      <UTooltip :text="mediaState.screenSharing ? 'Stop sharing' : 'Share screen'">
        <UButton
          variant="ghost"
          size="sm"
          @click="handleScreenShare"
          :class="mediaState.screenSharing ? 'bg-primary/20 text-primary' : ''"
        >
          <UIcon
            :name="mediaState.screenSharing ? 'i-heroicons-computer-desktop' : 'i-heroicons-arrow-up-on-square'"
            class="w-4 h-4"
          />
        </UButton>
      </UTooltip>
    </div>

    <!-- Video panel -->
    <Teleport to="body">
      <div
        v-if="showVideoPanel"
        class="fixed bottom-4 right-4 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
          <span class="text-sm font-medium">Video Call</span>
          <UButton variant="ghost" size="xs" @click="showVideoPanel = false">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </UButton>
        </div>

        <!-- Videos -->
        <div class="p-2 space-y-2">
          <!-- Local video -->
          <div class="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref="localVideoRef"
              autoplay
              muted
              playsinline
              class="w-full h-full object-cover"
            ></video>
            <div class="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-xs text-white">
              You
            </div>
          </div>

          <!-- Remote videos -->
          <div
            v-for="[peerId, stream] in remoteStreams"
            :key="peerId"
            class="relative aspect-video bg-black rounded-lg overflow-hidden"
          >
            <video
              autoplay
              playsinline
              :srcObject="stream"
              class="w-full h-full object-cover"
            ></video>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-2 px-3 py-2 bg-muted/50 border-t border-border">
          <UButton
            variant="ghost"
            size="sm"
            @click="toggleAudio"
            :class="!mediaState.audioEnabled ? 'text-destructive' : ''"
          >
            <UIcon
              :name="mediaState.audioEnabled ? 'i-heroicons-microphone' : 'i-heroicons-microphone-slash'"
              class="w-4 h-4"
            />
          </UButton>
          <UButton
            variant="ghost"
            size="sm"
            @click="toggleVideo"
            :class="!mediaState.videoEnabled ? 'text-destructive' : ''"
          >
            <UIcon
              :name="mediaState.videoEnabled ? 'i-heroicons-video-camera' : 'i-heroicons-video-camera-slash'"
              class="w-4 h-4"
            />
          </UButton>
          <UButton
            variant="destructive"
            size="sm"
            @click="leaveCall"
          >
            <UIcon name="i-heroicons-phone-x-mark" class="w-4 h-4" />
          </UButton>
        </div>
      </div>
    </Teleport>
  </div>
</template>
