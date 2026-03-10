<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick, shallowRef } from "vue";
import LoadingModal from "./LoadingModal.vue";
import ViewerHUD from "./ViewerHUD.vue";
import ViewerControls from "./ViewerControls.vue";
import { Renderer } from "./renderer";
import { PlaybackEngine, type PlaybackState } from "./playback";
import { Camera } from "./camera";
import { fetchWithProgress } from "./fetchWithProgress";

async function waitForNextPaint() {
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

const props = defineProps<{
  mapName: string;
  replayId: string;
  show: boolean;
}>();

const emit = defineEmits(["close"]);

// Other API calls use relative path in dev (goes through Vite proxy to prod)
const apiBaseUrl = import.meta.env.DEV ? "/api" : "https://offstyles.tommyy.dev/api";

// State
const isLoading = ref(true);
const stepLabel = ref("Initializing...");
const progress = ref<number | null>(null);
const errorMessage = ref<string | null>(null);
const currentStep = ref(0);
const totalSteps = 7;

const canvas = ref<HTMLCanvasElement | null>(null);
const controlsRef = ref<InstanceType<typeof ViewerControls> | null>(null);

// Non-reactive engine references (not tracked by Vue)
let renderer: Renderer | null = null;
let playbackEngine: PlaybackEngine | null = null;
let camera: Camera | null = null;
let animFrameId: number | null = null;

// Reactive state exposed to child components
const playbackState = shallowRef<PlaybackState>({
  tick: 0,
  position: new Float32Array(3),
  angles: new Float32Array(2),
  buttons: 0,
  flags: 0,
  eyeHeight: 64,
  speed: 0,
  isPlaying: true,
  playbackRate: 1.0,
  totalTicks: 0,
  tickRate: 100,
  time: 0,
});
const isFreecam = ref(false);

// Expose non-reactive refs for ViewerControls
const playbackRef = shallowRef<PlaybackEngine | null>(null);
const cameraRef = shallowRef<Camera | null>(null);

watch(
  () => props.show,
  async (newShow) => {
    if (newShow) {
      document.body.style.overflow = "hidden";
      isLoading.value = true;
      errorMessage.value = null;
      currentStep.value = 0;
      await nextTick();
      try {
        await initViewer();
      } catch (err) {
        console.error("Replay viewer init failed:", err);
        errorMessage.value =
          err instanceof Error ? err.message : "Failed to initialize replay viewer";
      }
    } else {
      cleanup();
      document.body.style.overflow = "";
    }
  },
);

onUnmounted(() => {
  cleanup();
  document.body.style.overflow = "";
});

async function initViewer() {
  // Step 1: Init WASM
  currentStep.value = 1;
  stepLabel.value = "Initializing WASM...";
  progress.value = null;
  const wasm = await import("./wasm/bhop_replay_viewer_wasm");
  await wasm.default();

  // Step 2: Download BSP
  currentStep.value = 2;
  stepLabel.value = "Downloading map...";
  progress.value = 0;
  const bspUrl = `${apiBaseUrl}/bsp?map=${encodeURIComponent(props.mapName)}`;
  const bz2Data = await fetchWithProgress(bspUrl, (received, total) => {
    if (total) {
      progress.value = received / total;
      const pct = Math.round((received / total) * 100);
      stepLabel.value = `Downloading map... ${pct}% (${(received / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)}MB)`;
    } else {
      progress.value = null; // indeterminate
      stepLabel.value = `Downloading map... ${(received / 1024 / 1024).toFixed(1)}MB`;
    }
  });

  // Step 3: Decompress
  currentStep.value = 3;
  stepLabel.value = "Decompressing BSP...";
  progress.value = null;
  await waitForNextPaint();
  const bspBytes = wasm.decompress_bz2(new Uint8Array(bz2Data));

  // Step 4: Parse BSP
  currentStep.value = 4;
  stepLabel.value = "Parsing map geometry...";
  await waitForNextPaint();
  const mesh = wasm.parse_bsp(bspBytes);
  const vertices = mesh.vertex_data();
  const indices = mesh.index_data();

  // Step 5: Upload to GPU
  currentStep.value = 5;
  stepLabel.value = "Uploading to GPU...";
  if (!canvas.value) throw new Error("Canvas not mounted");
  renderer = new Renderer(canvas.value);
  renderer.uploadMap(vertices, indices);

  // Upload lightmap atlas
  const lmData = mesh.lightmap_atlas_data();
  const lmW = mesh.lightmap_width();
  const lmH = mesh.lightmap_height();
  renderer.uploadLightmap(lmData, lmW, lmH);

  // Upload texture atlas
  const texData = mesh.texture_atlas_data();
  const texW = mesh.texture_atlas_width();
  const texH = mesh.texture_atlas_height();
  renderer.uploadTextureAtlas(texData, texW, texH);

  // Set up PVS
  renderer.setPVS(mesh);

  // Upload skybox if present
  if (mesh.has_skybox()) {
    const skyData = mesh.skybox_data();
    const skyFace = mesh.skybox_face_size();
    renderer.uploadSkybox(skyData, skyFace);
  }

  // Upload sky depth faces for occlusion
  if (mesh.has_sky_faces()) {
    const skyVerts = mesh.sky_vertex_data();
    const skyIdxs = mesh.sky_index_data();
    renderer.uploadSkyDepth(skyVerts, skyIdxs);
  }

  // Set up animated textures
  const animInfo = mesh.animated_texture_info();
  if (animInfo.length > 0) {
    const animData = mesh.animated_frame_data();
    renderer.setupAnimatedTextures(animInfo, animData);
  }

  // Step 6: Download replay
  currentStep.value = 6;
  stepLabel.value = "Downloading replay...";
  progress.value = 0;
  const replayUrl = `${apiBaseUrl}/replay?id=${encodeURIComponent(props.replayId)}`;
  const replayBuf = await fetchWithProgress(
    replayUrl,
    (received, total) => {
      if (total) {
        progress.value = received / total;
        const pct = Math.round((received / total) * 100);
        stepLabel.value = `Downloading replay... ${pct}% (${(received / 1024).toFixed(0)} / ${(total / 1024).toFixed(0)}KB)`;
      } else {
        progress.value = null;
        stepLabel.value = `Downloading replay... ${(received / 1024).toFixed(0)}KB`;
      }
    },
    "include",
  );

  // Step 7: Parse replay
  currentStep.value = 7;
  stepLabel.value = "Parsing replay...";
  progress.value = null;
  await waitForNextPaint();
  const replay = wasm.parse_replay(new Uint8Array(replayBuf));

  const positions = replay.positions();
  const angles = replay.angles();
  const buttons = replay.buttons_array();
  const flags = replay.flags_array();

  // Init playback and camera
  playbackEngine = new PlaybackEngine(
    positions,
    angles,
    buttons,
    flags,
    replay.tick_count(),
    replay.tick_rate(),
    replay.time(),
  );
  camera = new Camera(canvas.value);

  playbackRef.value = playbackEngine;
  cameraRef.value = camera;

  // Ready
  isLoading.value = false;
  startRenderLoop();
}

function startRenderLoop() {
  let lastTime = performance.now();

  function frame(now: number) {
    if (!renderer || !playbackEngine || !camera) return;

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    playbackEngine.update(dt);
    camera.update(dt, playbackEngine.state);
    renderer.updateAnimations(now / 1000);
    renderer.render(camera.viewMatrix, playbackEngine.state.position, camera.isFreecam);

    // Update reactive state for Vue components
    playbackState.value = { ...playbackEngine.state };
    isFreecam.value = camera.isFreecam;

    // Update controls scrubber
    controlsRef.value?.updateScrubber();

    animFrameId = requestAnimationFrame(frame);
  }

  animFrameId = requestAnimationFrame(frame);
}

function cleanup() {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (camera) {
    camera.dispose();
    camera = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  playbackEngine = null;
  playbackRef.value = null;
  cameraRef.value = null;
  isLoading.value = true;

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function close() {
  cleanup();
  document.body.style.overflow = "";
  emit("close");
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black">
    <canvas ref="canvas" class="w-full h-full block" />

    <!-- Loading overlay -->
    <LoadingModal
      v-if="isLoading"
      :step-label="stepLabel"
      :progress="progress"
      :error-message="errorMessage"
      :current-step="currentStep"
      :total-steps="totalSteps"
      @close="close"
    />

    <!-- HUD -->
    <ViewerHUD v-if="!isLoading && !errorMessage" :state="playbackState" :is-freecam="isFreecam" />

    <!-- Controls -->
    <ViewerControls
      v-if="!isLoading && !errorMessage && playbackRef && cameraRef"
      ref="controlsRef"
      :playback="playbackRef"
      :camera="cameraRef"
      @close="close"
    />
  </div>
</template>
