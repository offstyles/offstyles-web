<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <div class="w-full max-w-5xl mx-auto px-4 py-8">
        <div class="mb-7">
          <h1 class="text-white text-2xl text-center mb-2">Servers</h1>
          <p class="text-sm text-gray-400 mb-4 text-center">Active servers that have submitted times within the last 2 weeks</p>
        </div>
        <!-- Server Statistics -->
        <div v-if="!loading && !error && servers.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div class="bg-main-700 rounded-md p-4">
            <div class="flex items-center">
              <div class="p-1.5 bg-main-400 rounded-md">
                <svg class="w-5 h-5 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-xs text-gray-400">Total Servers</h3>
                <p class="text-2xl font-mono font-medium text-gray-100">{{ totalServers }}</p>
              </div>
            </div>
          </div>

          <div class="bg-main-700 rounded-md p-4">
            <div class="flex items-center">
              <div class="p-1.5 bg-green-900/50 rounded-md">
                <div class="w-5 h-5 bg-green-500/80 rounded-full"></div>
              </div>
              <div class="ml-3">
                <h3 class="text-xs text-gray-400">Active Servers</h3>
                <p class="text-2xl font-mono font-medium text-green-400">{{ activeServers.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-main-700 rounded-md p-4">
            <div class="flex items-center">
              <div class="p-1.5 bg-red-900/50 rounded-md">
                <div class="w-5 h-5 bg-red-500/80 rounded-full"></div>
              </div>
              <div class="ml-3">
                <h3 class="text-xs text-gray-400">Inactive Servers</h3>
                <p class="text-2xl font-mono font-medium text-red-400">{{ inactiveServers.length }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-main-700 rounded-md overflow-hidden">
          <div class="px-5 pr-4 py-4 bg-main-900">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-base  font-medium text-gray-100">Connected Servers</h2>
                <p class="text-sm text-gray-400">

                </p>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  @click="loadServers"
                  :disabled="loading"
                  class="px-2.5 py-2 text-sm text-gray-100 bg-main-400 rounded-md hover:bg-main-300 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <div :class="loading ? 'animate-spin' : ''">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-gray-200"
                    >
                      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div v-if="loading" class="p-8 text-center flex flex-col items-center align-center">
            <loadWheel></loadWheel>
            <p class="mt-2 text-gray-300">Loading servers...</p>
          </div>

          <div v-else-if="error" class="p-8 text-center text-red-400">
            <p>{{ error }}</p>
          </div>

          <div v-else-if="servers.length === 0" class="p-8 text-center text-gray-300">
            <p>No servers found</p>
          </div>

          <div v-else class="divide-y divide-gray-700">
            <div
              v-for="server in servers"
              :key="server._id"
              @click="openServerModal(server)"
              class="group p-6 py-4 hover:bg-main-500 transition-colors bg-main-600 odd:bg-main-700 relative cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full mr-6',
                      server.active ? 'bg-green-500' : 'bg-red-500'
                    ]"
                  ></div>
                  <div>
                    <h3 class="text-base font-medium text-gray-100">{{ server.name }}</h3>
                    <div class="flex items-center flex-wrap gap-1 mt-1">
                      <!-- Show server IPs if available, otherwise show legacy IPs -->
                      <template v-if="server.servers && server.servers.length > 0">
                        <span
                          v-for="(subserver, index) in server.servers"
                          :key="subserver.ip"
                          class="text-sm text-gray-200 monospace pr-1 py-0.5"
                          :title="`${subserver.name}: ${subserver.ip}`"
                        >
                          <span
                            @click.stop="copyToClipboard(subserver.ip)"
                            class="cursor-pointer hover:text-gray-200 hover:bg-main-200 transition-colors rounded p-0.5"
                          >{{ subserver.ip }}</span>
                          <span v-if="index < server.servers.length - 1" class="text-gray-400 -ml-0.5">,</span>
                        </span>
                      </template>
                      <template v-else>
                        <span class="text-sm text-gray-400">No servers configured</span>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-3">
                  <!-- Edit Server Button (shown on hover for server owners) -->
                  <button
                    v-if="canEditServer(server)"
                    @click.stop="openServerModal(server)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 text-xs font-medium text-gray-300 bg-blue-700 hover:bg-blue-600 border border-blue-500 hover:border-blue-400 rounded-md hover:text-gray-100 transition-colors cursor-pointer mr-3 min-w-24"
                    title="Edit server details"
                  >
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/>
                    </svg>
                    Edit Server
                  </button>

                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      server.active
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-900 text-red-400'
                    ]"
                  >
                    {{ server.active ? 'Active' : 'Inactive' }}
                  </span>

                  <!-- Show "Editable" badge for servers the user can edit -->
                  <span
                    v-if="canEditServer(server)"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-400 ml-2"
                    title="You can edit this server"
                  >
                    Editable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>




    </div>

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :type="toastType"
      :title="toastTitle"
      :message="toastMessage"
      @close="closeToast"
    />

    <!-- Server Details Modal -->
    <ServerModal
      v-if="showServerModal && selectedServer"
      :server="selectedServer"
      :show="showServerModal"
      @close="closeServerModal"
      @updated="onServerUpdated"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import OffstylesApi from '@/api/offstylesApi';
import type { ServerDataDocument, ServerActivityResponse } from '@/api/offstylesApi';
import { useAuth } from '@/stores/auth';
import Toast from '@/components/Toast.vue';
import ServerModal from '@/components/ServerModal.vue';
import loadWheel from '@/components/icons/loadWheel.vue';

// Auth
const { user } = useAuth();

// Check if user can edit a specific server (owner or admin)
const canEditServer = (server: ServerActivityResponse) => {
  if (!user.value) return false;
  return user.value.steam_id === server.user.steam_id || user.value.permissions > 0;
};

// Data
const servers = ref<ServerActivityResponse[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Modal state
const showServerModal = ref(false);
const selectedServer = ref<ServerDataDocument | null>(null);

// Computed properties for server statistics
const activeServers = computed(() => servers.value.filter((s: ServerActivityResponse) => s.active === true));
const inactiveServers = computed(() => servers.value.filter((s: ServerActivityResponse) => s.active === false));
const totalServers = computed(() => servers.value.length);



// Toast state
const showToast = ref(false);
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info');
const toastTitle = ref('');
const toastMessage = ref('');

// Forms


// Methods
const loadServers = async () => {
  try {
    loading.value = true;
    error.value = null;
    const serverData = await OffstylesApi.getServers();

    // Use ServerActivityResponse directly, no transformation needed
    servers.value = serverData.sort((a,b) => Number(b.active) - Number(a.active));
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load servers';
    console.error('Failed to load servers:', err);
  } finally {
    loading.value = false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToastMessage('success', 'Copied!', `IP address ${text} copied to clipboard`);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToastMessage('success', 'Copied!', `IP address ${text} copied to clipboard`);
  }
};



const showToastMessage = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string = '') => {
  toastType.value = type;
  toastTitle.value = title;
  toastMessage.value = message;
  showToast.value = true;
};

const closeToast = () => {
  showToast.value = false;
};

// Server modal methods
const openServerModal = (server: ServerActivityResponse) => {
  // Convert ServerActivityResponse to ServerDataDocument
  const serverDoc: ServerDataDocument = {
    _id: server._id,
    name: server.name,
    servers: server.servers,
    user: server.user,
    permissions: server.permissions,
    active: server.active
  };

  selectedServer.value = serverDoc;
  showServerModal.value = true;
};

const closeServerModal = () => {
  showServerModal.value = false;
  selectedServer.value = null;
};

const onServerUpdated = (updatedServer: ServerDataDocument) => {
  // Find and update the server in the list
  const index = servers.value.findIndex(s => s._id === updatedServer._id);
  if (index !== -1 && updatedServer._id) {
    // Convert ServerDataDocument back to ServerActivityResponse format
    servers.value[index] = {
      _id: updatedServer._id,
      name: updatedServer.name,
      servers: updatedServer.servers,
      user: updatedServer.user,
      permissions: updatedServer.permissions || 0,
      active: updatedServer.active || false
    };
  }
  selectedServer.value = updatedServer;
};

// Lifecycle
onMounted(() => {
  loadServers();
});
</script>

<style scoped>
/* Override global focus styles to completely remove all outlines */
input[type="text"]:focus,
input[type="checkbox"]:focus,
button:focus {
  outline: none !important;
  box-shadow: none !important;
  border-color: inherit !important;
  --tw-ring-shadow: none !important;
  --tw-ring-offset-shadow: none !important;
}

/* Remove any Tailwind focus rings */
.focus\:outline-none:focus,
.focus\:ring-0:focus,
input:focus,
button:focus {
  --tw-ring-offset-width: 0px !important;
  --tw-ring-offset-color: transparent !important;
  --tw-ring-color: transparent !important;
  --tw-ring-offset-shadow: none !important;
  --tw-ring-shadow: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* Smooth transitions for hover effects */
.group:hover {
  transition: all 0.2s ease-in-out;
}

/* Ensure the edit button appears smoothly on hover */
.group .opacity-0 {
  transition: opacity 0.2s ease-in-out;
}
</style>
