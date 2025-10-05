<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg w-[500px] max-w-[90vw] mx-4 relative" @click.stop>
      <!-- Close X Button -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer z-10"
        title="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="overflow-y-auto max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 bg-main-900 border-b border-main-600">
          <h2 class="text-xl font-semibold text-gray-100 pr-8">Create New Server</h2>
          <p class="text-sm text-gray-400 mt-1">Create a new server with an API key to manage sub-servers</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="createServer" class="px-6 py-4">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Server Name <span class="text-red-400">*</span>
            </label>
            <input
              v-model="serverName"
              type="text"
              :disabled="!hasPermission"
              class="w-full px-3 py-2 bg-main-900 border border-main-600 text-gray-100 rounded-md focus:outline-none focus:border-main-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter server name (e.g., My KZ Server)"
              required
            />
            <p class="text-xs text-gray-400 mt-1">This will be the main identifier for your server</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Owner (Optional)
            </label>
            <input
              v-model="ownerSteamId"
              type="text"
              :disabled="!hasPermission"
              class="w-full px-3 py-2 bg-main-900 border border-main-600 text-gray-100 rounded-md focus:outline-none focus:border-main-400 transition-colors monospace disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Steam ID (leave empty to set yourself as owner)"
            />
            <p class="text-xs text-gray-400 mt-1">The Steam ID of the server owner. Defaults to you if left empty.</p>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-300">
                Sub-Servers (Optional)
              </label>
              <button
                type="button"
                @click="addSubServer"
                :disabled="!hasPermission"
                class="px-2 py-1 text-xs font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Server
              </button>
            </div>

            <div v-if="subServers.length === 0" class="text-center py-4 text-gray-400 text-sm border border-main-600 rounded-md bg-main-900">
              No sub-servers added yet. You can add them now or later.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(server, index) in subServers"
                :key="index"
                class="bg-main-900 border border-main-600 rounded-md p-3"
              >
                <div class="flex items-start justify-between mb-2">
                  <input
                    v-model="server.name"
                    type="text"
                    :disabled="!hasPermission"
                    class="flex-1 px-2 py-1 text-sm bg-main-800 border border-main-600 text-gray-100 rounded focus:outline-none focus:border-main-400 disabled:opacity-50"
                    placeholder="Server name"
                    required
                  />
                  <button
                    type="button"
                    @click="removeSubServer(index)"
                    :disabled="!hasPermission"
                    class="ml-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <input
                  v-model="server.ip"
                  type="text"
                  :disabled="!hasPermission"
                  class="w-full px-2 py-1 text-sm bg-main-800 border border-main-600 text-gray-100 rounded focus:outline-none focus:border-main-400 monospace mb-2 disabled:opacity-50"
                  placeholder="IP:Port (e.g., 192.168.1.100:27015)"
                  required
                />
                <div class="flex flex-wrap gap-2">
                  <label class="flex items-center">
                    <input
                      v-model="server.whitelist"
                      type="checkbox"
                      :disabled="!hasPermission"
                      class="rounded border-main-600 text-green-500 bg-main-800 focus:outline-none focus:ring-0 disabled:opacity-50"
                    />
                    <span class="ml-1.5 text-xs text-gray-300">Whitelist</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="server.password"
                      type="checkbox"
                      :disabled="!hasPermission"
                      class="rounded border-main-600 text-green-500 bg-main-800 focus:outline-none focus:ring-0 disabled:opacity-50"
                    />
                    <span class="ml-1.5 text-xs text-gray-300">Password</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="server.vac_secure"
                      type="checkbox"
                      :disabled="!hasPermission"
                      class="rounded border-main-600 text-green-500 bg-main-800 focus:outline-none focus:ring-0 disabled:opacity-50"
                    />
                    <span class="ml-1.5 text-xs text-gray-300">VAC Secure</span>
                  </label>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Add server IP addresses that will use this API key</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">
              API Permissions
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="permissions.submitTimes"
                  type="checkbox"
                  :disabled="!hasPermission"
                  class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span class="ml-2 text-sm text-gray-200">Submit Times</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="permissions.submitBulk"
                  type="checkbox"
                  :disabled="!hasPermission"
                  class="rounded border-main-600 text-green-500 bg-main-900 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span class="ml-2 text-sm text-gray-200">Submit Bulk</span>
              </label>
            </div>
            <p class="text-xs text-gray-400 mt-2">Select what actions this server's API key can perform</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p class="text-sm text-red-300">{{ errorMessage }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p class="text-sm text-green-300">{{ successMessage }}</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!hasPermission || isCreating || !serverName.trim()"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? 'Creating...' : 'Create Server' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import OffstylesApi from '@/api/offstylesApi';
import type { ServerDataDocument, ServerInfo } from '@/api/offstylesApi';
import { useAuth } from '@/stores/auth';
import { canManageApiKeys } from '@/utils/userPermissions';

// Props
interface Props {
  show: boolean;
}

defineProps<Props>();

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'created', server: ServerDataDocument): void;
}

const emit = defineEmits<Emits>();

// Auth
const { user } = useAuth();

// Permission check
const hasPermission = computed(() => {
  if (!user.value) return false;
  return canManageApiKeys(user.value.permissions);
});

// State
const serverName = ref('');
const ownerSteamId = ref('');
const subServers = ref<ServerInfo[]>([]);
const permissions = ref({
  submitTimes: true,
  submitBulk: false
});
const isCreating = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Check permissions on mount
onMounted(() => {
  if (!hasPermission.value) {
    errorMessage.value = 'You do not have permission to create servers. Contact an administrator.';
  }
});

// Methods
const closeModal = () => {
  emit('close');
};

const calculatePermissions = (): number => {
  let perms = 0;
  if (permissions.value.submitTimes) perms |= 1; // Submit times permission
  if (permissions.value.submitBulk) perms |= 2; // Submit bulk permission
  return perms;
};

const addSubServer = () => {
  subServers.value.push({
    name: '',
    ip: '',
    whitelist: false,
    password: false,
    vac_secure: false
  });
};

const removeSubServer = (index: number) => {
  subServers.value.splice(index, 1);
};

const createServer = async () => {
  if (!serverName.value.trim()) return;

  try {
    isCreating.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const permissionValue = calculatePermissions();
    const owner = ownerSteamId.value.trim() || undefined;

    const newServer = await OffstylesApi.createServer(
      serverName.value.trim(),
      owner,
      subServers.value,
      permissionValue
    );

    successMessage.value = 'Server created successfully!';

    // Emit the created server and close after a short delay
    setTimeout(() => {
      emit('created', newServer);
      emit('close');
    }, 1000);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to create server';
    console.error('Failed to create server:', error);
  } finally {
    isCreating.value = false;
  }
};
</script>

<style scoped>
/* Override global focus styles */
input[type="text"]:focus,
input[type="checkbox"]:focus,
button:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
