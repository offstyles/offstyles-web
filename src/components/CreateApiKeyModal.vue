<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg w-[600px] max-w-[90vw] mx-4 relative" @click.stop>
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
          <h2 class="text-xl font-semibold text-gray-100 pr-8">Create New API Key</h2>
          <p class="text-sm text-gray-400 mt-1">Create a new API key with server configuration</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="createApiKey" class="px-6 py-4">
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

          <!-- Success Message with API Key -->
          <div v-if="successMessage && apiKey" class="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p class="text-sm text-green-300 font-semibold mb-3">{{ successMessage }}</p>

            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-300 mb-1">API Key:</label>
              <div class="relative">
                <div
                  @click="copyApiKey"
                  class="w-full px-3 py-2 bg-main-900 border border-green-600 rounded-md cursor-pointer hover:bg-main-800 transition-colors group"
                  title="Click to copy API key"
                >
                  <code class="text-sm text-gray-100 monospace break-all">{{ apiKey }}</code>
                </div>
                <button
                  type="button"
                  @click="copyApiKey"
                  class="absolute top-2 right-2 px-2 py-1 text-xs bg-green-700 hover:bg-green-600 text-gray-100 rounded transition-colors"
                >
                  <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <p class="text-xs text-yellow-300 mt-2">
              ⚠️ <strong>Important:</strong> Save this API key now! You won't be able to see it again in plain text. You can view it in the server details later, but it will be hidden.
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p class="text-sm text-red-300">{{ errorMessage }}</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              {{ successMessage ? 'Close' : 'Cancel' }}
            </button>
            <button
              v-if="!successMessage"
              type="submit"
              :disabled="!hasPermission || isCreating || !serverName.trim()"
              class="px-4 py-2 text-sm font-medium text-gray-100 bg-green-700 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? 'Creating...' : 'Create API Key' }}
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
import type { ServerInfo } from '@/api/offstylesApi';
import { useAuth } from '@/stores/auth';
import { canManageApiKeys } from '@/utils/userPermissions';
import { KeyPermissions, addPermission } from '@/utils/permissions';

// Props
interface Props {
  show: boolean;
}

defineProps<Props>();

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'created'): void;
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
const apiKey = ref('');

// Check permissions on mount
onMounted(() => {
  if (!hasPermission.value) {
    errorMessage.value = 'You do not have permission to create API keys. Contact an administrator.';
  }
});

// Methods
const closeModal = () => {
  emit('close');
};

const calculatePermissions = (): number => {
  let perms = 0;
  if (permissions.value.submitTimes) {
    perms = addPermission(perms, KeyPermissions.SUBMIT_TIMES);
  }
  if (permissions.value.submitBulk) {
    perms = addPermission(perms, KeyPermissions.SUBMIT_BULK);
  }
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

const copyApiKey = async () => {
  if (apiKey.value) {
    try {
      await navigator.clipboard.writeText(apiKey.value);
    } catch (err) {
      console.error('Failed to copy API key to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = apiKey.value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
};

const createApiKey = async () => {
  if (!serverName.value.trim()) return;

  try {
    isCreating.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    apiKey.value = '';

    const permissionValue = calculatePermissions();
    const owner = ownerSteamId.value.trim() || undefined;

    const result = await OffstylesApi.createServer(
      serverName.value.trim(),
      owner,
      subServers.value,
      permissionValue
    );

    apiKey.value = result.key;
    successMessage.value = 'API key created successfully!';

    // Emit the created event to refresh the server list
    emit('created');

    // Don't close automatically - let user copy the key first
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to create API key';
    console.error('Failed to create API key:', error);
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
